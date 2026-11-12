"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
  RotateCcw,
  ScanEye,
  Upload,
  X,
} from "lucide-react";
import type { Task, User } from "@/types";
import { Badge } from "@/components/ui";

export function TaskActions({ task, user }: { task: Task; user: User }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isBuyer = user.id === task.buyerId;
  const isProvider = user.id === task.providerId;
  const isAdmin = user.role === "admin";

  async function act(action: "accept" | "start" | "confirm" | "dispute" | "cancel") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  async function reverify() {
    setBusy("verify");
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}/verify`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusy(null);
    }
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy("upload");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("note", note);
      const res = await fetch(`/api/tasks/${task.id}/evidence`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      // Evidence in — let the verification agent look at it immediately.
      const verify = await fetch(`/api/tasks/${task.id}/verify`, { method: "POST" });
      if (!verify.ok) {
        const v = await verify.json().catch(() => ({}));
        setError(v.error ?? "Evidence saved, but verification did not complete.");
      }
      setFile(null);
      setNote("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  const canUpload = isProvider && ["assigned", "in_progress", "submitted", "awaiting_confirmation"].includes(task.status);
  const canConfirm = (isBuyer || isAdmin) && ["submitted", "ai_review", "awaiting_confirmation"].includes(task.status);
  const canReview = task.evidence.length > 0 && !["open", "awaiting_payment"].includes(task.status);

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-[12px] bg-danger-soft px-3 py-2 text-[11.5px] text-danger">{error}</p>
      ) : null}

      {/* Provider: accept / start */}
      {isProvider && task.status === "open" ? (
        <button onClick={() => act("accept")} disabled={Boolean(busy)} className="btn btn-primary w-full py-2.5">
          {busy === "accept" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          Accept this task
        </button>
      ) : null}

      {isProvider && task.status === "assigned" ? (
        <button onClick={() => act("start")} disabled={Boolean(busy)} className="btn btn-dark w-full py-2.5">
          {busy === "start" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Start work on site
        </button>
      ) : null}

      {/* Provider: evidence upload */}
      {canUpload ? (
        <form onSubmit={upload} className="rounded-[18px] border border-line p-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium">Submit evidence</p>
            <Badge tone="ocean">photo · PDF</Badge>
          </div>

          <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-line bg-[#fbf9f5] px-3 py-5 text-center transition hover:border-[#ffcbb4]">
            <Upload size={16} className="text-muted" />
            <span className="text-[11.5px] text-ink-2">
              {file ? file.name : "Drop a photo or choose a file"}
            </span>
            <span className="text-[10px] text-muted">JPG, PNG, WEBP or PDF · up to 8 MB</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Short note for the customer (e.g. reading is 48213 kWh)"
            className="field mt-2 text-[12px]"
          />

          <button
            type="submit"
            disabled={!file || Boolean(busy)}
            className="btn btn-primary mt-2 w-full py-2 text-[12.5px]"
          >
            {busy === "upload" ? <Loader2 size={13} className="animate-spin" /> : <ScanEye size={13} />}
            {busy === "upload" ? "Uploading & verifying…" : "Submit for AI verification"}
          </button>
        </form>
      ) : null}

      {/* Buyer: confirm */}
      {canConfirm ? (
        <div className="space-y-2">
          <button
            onClick={() => act("confirm")}
            disabled={Boolean(busy)}
            className="btn btn-primary w-full py-2.5"
          >
            {busy === "confirm" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Approve completion
          </button>
          <button
            onClick={reverify}
            disabled={Boolean(busy)}
            className="btn btn-ghost w-full py-2 text-[12.5px]"
          >
            {busy === "verify" ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
            Re-run AI review
          </button>
        </div>
      ) : null}

      {canReview && !canConfirm ? (
        <button
          onClick={reverify}
          disabled={Boolean(busy)}
          className="btn btn-ghost w-full py-2 text-[12.5px]"
        >
          {busy === "verify" ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
          Re-run AI review
        </button>
      ) : null}

      {/* Dispute / cancel */}
      <div className="flex gap-2">
        {!["completed", "cancelled", "disputed"].includes(task.status) && (isBuyer || isProvider || isAdmin) ? (
          <button
            onClick={() => act("dispute")}
            disabled={Boolean(busy)}
            className="btn btn-quiet flex-1 py-2 text-[11.5px]"
          >
            {busy === "dispute" ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
            Dispute
          </button>
        ) : null}
        {(isBuyer || isAdmin) && task.status !== "completed" && task.status !== "cancelled" ? (
          <button
            onClick={() => act("cancel")}
            disabled={Boolean(busy)}
            className="btn btn-quiet flex-1 py-2 text-[11.5px] text-danger"
          >
            {busy === "cancel" ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
            Cancel task
          </button>
        ) : null}
      </div>
    </div>
  );
}
