import { ok } from "@/lib/http";
import { paypalClientId, paypalConfigured, paypalMode } from "@/lib/payments";

export async function GET() {
  return ok({
    mode: paypalMode(),
    configured: paypalConfigured(),
    clientId: paypalConfigured() ? paypalClientId() : null,
    currency: "USD",
  });
}
