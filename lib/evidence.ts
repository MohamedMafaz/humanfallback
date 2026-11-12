import fs from "node:fs";
import path from "node:path";
import type { Evidence, Task, User, Verification } from "@/types";
import { UPLOAD_DIR, mutate } from "./store";
import { id } from "./crypto";
import { notify, pushEvent } from "./repo";
import { verifyEvidence } from "./ai/agents";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "").slice(-60) || "evidence";
}

/** Persists an uploaded file and returns its evidence record. */
export function storeEvidence(args: {
  task: Task;
  file: File;
  bytes: Buffer;
  note: string;
  uploader: User;
}): Evidence {
  const { task, file, bytes, note, uploader } = args;
  const ext = path.extname(file.name).toLowerCase() || (file.type === "application/pdf" ? ".pdf" : ".jpg");
  const base = safeName(path.basename(file.name, path.extname(file.name)));
  const stored = `${task.id}_${Date.now()}_${base}${ext}`;

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, stored), bytes);

  const evidence: Evidence = {
    id: id("e_"),
    kind: file.type === "application/pdf" ? "document" : "image",
    fileName: file.name,
    url: `/api/files/${stored}`,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: bytes.length,
    note: note.slice(0, 500),
    uploadedById: uploader.id,
    uploadedAt: new Date().toISOString(),
  };
  return evidence;
}

/** Resolves an evidence URL to a data URL the vision model can read. */
export function readEvidenceData(url: string): string | null {
  try {
    let filePath: string | null = null;
    if (url.startsWith("/demo/")) {
      filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    } else if (url.startsWith("/api/files/")) {
      filePath = path.join(UPLOAD_DIR, path.basename(url));
    }
    if (!filePath || !fs.existsSync(filePath)) return null;
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".pdf") return null;
    const bytes = fs.readFileSync(filePath);
    if (bytes.length > 5 * 1024 * 1024) return null;
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Runs the Evidence Verification Agent over a task's submitted images.
 * Verification is advisory: it never captures, refunds or completes a payment.
 */
export async function runVerification(task: Task, submitter: User | null): Promise<Verification> {
  const images = task.evidence
    .map((e) => readEvidenceData(e.url))
    .filter((x): x is string => Boolean(x))
    .slice(0, 3);

  const note = task.evidence
    .map((e) => e.note)
    .filter(Boolean)
    .join(" ");

  task.status = "ai_review";
  pushEvent(task, "ai_review", "agent", "Verification agent is reviewing the submitted evidence.");

  const verification = await verifyEvidence({
    task,
    images,
    note,
    providerName: submitter?.name,
  });

  mutate(() => {
    task.verification = verification;
    task.status = "awaiting_confirmation";
    pushEvent(
      task,
      "ai_review",
      "agent",
      `${verdictLabel(verification.verdict)} — ${Math.round(verification.confidence * 100)}% confidence.`,
    );
  });

  notify(
    task.buyerId,
    "Evidence ready for review",
    `${task.code} · ${verdictLabel(verification.verdict)} (${Math.round(
      verification.confidence * 100,
    )}% confidence).`,
    task.id,
  );

  return verification;
}

export function verdictLabel(v: Verification["verdict"]): string {
  switch (v) {
    case "verified":
      return "Evidence verified";
    case "partially_verified":
      return "Partially verified";
    case "insufficient":
      return "More evidence required";
    case "failed":
      return "Verification failed";
  }
}
