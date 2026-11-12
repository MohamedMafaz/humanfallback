"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";

export function AdminReset() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function reset() {
    if (!confirm("Restore the seeded demo dataset? Tasks and payments created during the demo will be replaced.")) return;
    setBusy(true);
    try {
      await fetch("/api/admin/reset", { method: "POST" });
      setDone(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={reset} disabled={busy} className="btn btn-ghost py-2 text-[12px]">
      {busy ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
      {done ? "Demo restored" : "Reset demo data"}
    </button>
  );
}
