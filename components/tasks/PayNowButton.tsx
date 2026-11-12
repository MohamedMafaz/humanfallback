"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";

/**
 * Creates the PayPal order and, in live Sandbox mode, forwards the buyer to the
 * hosted PayPal checkout. In simulator mode it captures immediately.
 */
export function PayNowButton({
  taskId,
  total,
  resumable = false,
}: {
  taskId: string;
  total: number;
  resumable?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const order = await fetch(`/api/tasks/${taskId}/pay`, { method: "POST" });
      const orderData = await order.json();
      if (!order.ok) throw new Error(orderData.error ?? "Could not create the order");

      if (orderData.mode === "paypal") {
        const url =
          orderData.approveUrl ??
          `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.orderId}`;
        window.location.href = url;
        return;
      }

      const capture = await fetch(`/api/tasks/${taskId}/capture`, { method: "POST" });
      const captureData = await capture.json();
      if (!capture.ok) throw new Error(captureData.error ?? "Capture failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={pay} disabled={busy} className="btn btn-primary w-full py-2.5">
        {busy ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
        {busy ? "Opening PayPal…" : resumable ? "Continue to PayPal" : `Pay $${total.toFixed(2)} with PayPal`}
      </button>
      {error ? <p className="mt-2 text-[11px] text-danger">{error}</p> : null}
    </div>
  );
}
