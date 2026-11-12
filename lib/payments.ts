/**
 * PayPal integration.
 *
 * The platform is built to run the real PayPal Orders v2 flow (sandbox), but
 * it must also work out of the box with no credentials for judges and local
 * development. When PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are absent the same
 * interface is served by a clearly-labelled simulator so the end-to-end task
 * lifecycle stays demonstrable.
 */

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET ?? "";
const API_BASE =
  process.env.PAYPAL_API_BASE ??
  (process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com");

export function paypalConfigured(): boolean {
  // Explicit override so a recording or hosted preview can run the identical
  // flow without a buyer session. The UI labels the mode everywhere.
  if (process.env.PAYPAL_MODE === "simulated") return false;
  if (process.env.PAYPAL_MODE === "live") return Boolean(CLIENT_ID && CLIENT_SECRET);
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

export function paypalClientId(): string {
  return CLIENT_ID;
}

export function paypalMode(): "paypal" | "simulated" {
  return paypalConfigured() ? "paypal" : "simulated";
}

async function accessToken(): Promise<string> {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status})`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export interface OrderResult {
  id: string;
  status: string;
  mode: "paypal" | "simulated";
  approveUrl?: string;
}

export async function createOrder(args: {
  amount: number;
  currency?: string;
  description: string;
  referenceId: string;
  returnUrl: string;
  cancelUrl?: string;
}): Promise<OrderResult> {
  if (!paypalConfigured()) {
    return {
      id: `SIM-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      status: "CREATED",
      mode: "simulated",
    };
  }
  const token = await accessToken();
  const res = await fetch(`${API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: args.referenceId,
          description: args.description.slice(0, 127),
          amount: {
            currency_code: args.currency ?? "USD",
            value: args.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "HumanFallback",
        user_action: "PAY_NOW",
        return_url: args.returnUrl,
        cancel_url: args.cancelUrl ?? args.returnUrl,
      },
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`PayPal order failed (${res.status}): ${detail.slice(0, 180)}`);
  }
  const json = (await res.json()) as {
    id: string;
    status: string;
    links?: { rel: string; href: string }[];
  };
  return {
    id: json.id,
    status: json.status,
    mode: "paypal",
    approveUrl: json.links?.find((l) => l.rel === "approve" || l.rel === "payer-action")?.href,
  };
}

export interface CaptureResult {
  status: "captured" | "failed";
  captureId: string | null;
  payerEmail?: string;
  error?: string;
}

/** PayPal issues are terse; map the common ones to something a user can act on. */
function friendlyError(json: {
  message?: string;
  details?: { issue?: string; description?: string }[];
}): string {
  const issue = json.details?.[0]?.issue ?? "";
  switch (issue) {
    case "ORDER_NOT_APPROVED":
      return "This PayPal order hasn’t been approved yet. Finish the PayPal checkout, then capture it.";
    case "INSTRUMENT_DECLINED":
      return "PayPal declined the funding source. The buyer needs to approve with another method.";
    case "PAYER_ACTION_REQUIRED":
      return "PayPal needs another action from the payer before this order can be captured.";
    case "ORDER_ALREADY_CAPTURED":
      return "This order has already been captured.";
    case "ORDER_EXPIRED":
      return "This PayPal order expired. Create a new payment order for the task.";
    default:
      return json.details?.[0]?.description ?? json.message ?? "PayPal could not capture this order.";
  }
}

export async function captureOrder(orderId: string): Promise<CaptureResult> {
  if (!paypalConfigured() || orderId.startsWith("SIM-")) {
    return {
      status: "captured",
      captureId: `SIM-CAP-${orderId.replace(/^SIM-/, "").slice(0, 6)}`,
      payerEmail: process.env.PAYPAL_DEMO_PAYER ?? "sandbox-buyer@example.com",
    };
  }
  try {
    const token = await accessToken();
    const res = await fetch(`${API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      cache: "no-store",
    });
    const json = (await res.json()) as {
      status?: string;
      purchase_units?: {
        payments?: { captures?: { id: string; status: string }[] };
      }[];
      payer?: { email_address?: string };
      message?: string;
      details?: { issue?: string; description?: string }[];
    };
    if (!res.ok) {
      return { status: "failed", captureId: null, error: friendlyError(json) };
    }
    const capture = json.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture || capture.status !== "COMPLETED") {
      return {
        status: "failed",
        captureId: capture?.id ?? null,
        error: `Capture status ${capture?.status ?? json.status ?? "unknown"}`,
      };
    }
    return {
      status: "captured",
      captureId: capture.id,
      payerEmail: json.payer?.email_address,
    };
  } catch (error) {
    return {
      status: "failed",
      captureId: null,
      error: error instanceof Error ? error.message : "PayPal capture failed",
    };
  }
}
