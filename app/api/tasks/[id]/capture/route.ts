import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { currentUser } from "@/lib/session";
import { findTask, findUser, notify, pushEvent, recordTransaction } from "@/lib/repo";
import { mutate } from "@/lib/store";
import { captureOrder } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return fail("Sign in required", 401);
  const { id } = await ctx.params;

  const task = findTask(id);
  if (!task) return fail("Task not found", 404);
  if (task.buyerId !== user.id && user.role !== "admin") return fail("Not permitted", 403);

  // Idempotent: a captured payment is never captured twice.
  if (task.payment.status === "captured") {
    return ok({ task, captureId: task.payment.captureId, idempotent: true });
  }
  if (!task.payment.orderId) return fail("Create a payment order first.", 409);

  let orderId = task.payment.orderId;
  try {
    const body = (await req.json().catch(() => ({}))) as { orderId?: string };
    if (body.orderId) orderId = body.orderId;
  } catch {
    /* empty body is fine */
  }
  if (orderId !== task.payment.orderId) return fail("Order does not match this task.", 409);

  const result = await captureOrder(orderId);

  if (result.status !== "captured") {
    mutate(() => {
      task.payment.status = "failed";
      task.payment.error = result.error;
      pushEvent(task, "payment_failed", "system", result.error ?? "Payment capture failed.");
    });
    return fail(result.error ?? "Payment could not be captured", 402, { task });
  }

  mutate(() => {
    task.payment.status = "captured";
    task.payment.captureId = result.captureId;
    task.payment.payerEmail = result.payerEmail;
    task.payment.capturedAt = new Date().toISOString();
    task.payment.error = undefined;
    task.status = "open";
    pushEvent(
      task,
      "payment_captured",
      "system",
      `Payment captured (${result.captureId}). Task released to the provider.`,
    );
  });

  recordTransaction(task);

  const provider = findUser(task.providerId);
  if (provider) {
    notify(provider.id, "New task assigned", `${task.code} · ${task.title}`, task.id);
  }
  notify(user.id, "Payment captured", `$${task.payment.total.toFixed(2)} paid for ${task.code}.`, task.id);

  return ok({ task, captureId: result.captureId });
}
