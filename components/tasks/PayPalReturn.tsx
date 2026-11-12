"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

/**
 * When PayPal redirects back with ?paypal=return, capture the approved order
 * server-side and refresh the task.
 */
export function PayPalReturn({ taskId }: { taskId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<"idle" | "capturing" | "done" | "error">("idle");

  useEffect(() => {
    if (params.get("paypal") !== "return") return;
    let cancelled = false;
    setState("capturing");
    fetch(`/api/tasks/${taskId}/capture`, { method: "POST" })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setState("error");
          return;
        }
        setState("done");
        router.replace(`/tasks/${taskId}`);
        router.refresh();
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "idle") return null;

  return (
    <div
      className={
        state === "error"
          ? "mb-3 flex items-center gap-2.5 rounded-[18px] border border-danger/30 bg-danger-soft px-4 py-3 text-[12px] text-danger"
          : "mb-3 flex items-center gap-2.5 rounded-[18px] border border-forest/20 bg-lime-soft px-4 py-3 text-[12px] text-forest"
      }
    >
      {state === "capturing" ? <Loader2 size={15} className="animate-spin" /> : null}
      {state === "done" ? <CheckCircle2 size={15} /> : null}
      {state === "error" ? <TriangleAlert size={15} /> : null}
      {state === "capturing"
        ? "Verifying your PayPal payment…"
        : state === "done"
          ? "Payment captured. The task is released to the provider."
          : "We could not verify that capture. Reopen the task or try the payment again."}
    </div>
  );
}
