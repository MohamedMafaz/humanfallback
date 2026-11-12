import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { currentUser } from "@/lib/session";
import { findTask, notify, pushEvent } from "@/lib/repo";
import { mutate } from "@/lib/store";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, storeEvidence } from "@/lib/evidence";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return fail("Sign in required", 401);
  const { id } = await ctx.params;

  const task = findTask(id);
  if (!task) return fail("Task not found", 404);
  if (task.providerId !== user.id && user.role !== "admin") {
    return fail("Only the assigned provider can submit evidence.", 403);
  }
  if (!["assigned", "in_progress", "submitted", "ai_review", "awaiting_confirmation"].includes(task.status)) {
    return fail("Accept the task before submitting evidence.", 409);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Expected a multipart upload", 415);
  }

  const file = form.get("file");
  const note = String(form.get("note") ?? "").slice(0, 500);
  if (!(file instanceof File)) return fail("Attach a photo or PDF.", 422);
  if (file.size > MAX_UPLOAD_BYTES) return fail("Files must be 8 MB or smaller.", 413);
  if (file.type && !ALLOWED_MIME.includes(file.type)) {
    return fail("Supported formats: JPG, PNG, WEBP, HEIC, PDF.", 415);
  }
  if (!file.type && !note) return fail("Add a short description for this evidence.", 422);

  const bytes = Buffer.from(await file.arrayBuffer());
  const evidence = storeEvidence({ task, file, bytes, note, uploader: user });

  mutate(() => {
    task.evidence.push(evidence);
    if (task.status === "assigned" || task.status === "in_progress") task.status = "submitted";
    pushEvent(
      task,
      "evidence",
      "provider",
      `${user.name} submitted ${evidence.kind === "image" ? "a photo" : "a document"}${
        note ? " with a note" : ""
      }.`,
    );
  });

  notify(task.buyerId, "Evidence submitted", `${task.code} · ${user.name} submitted evidence.`, task.id);

  return ok({ evidence, task }, 201);
}
