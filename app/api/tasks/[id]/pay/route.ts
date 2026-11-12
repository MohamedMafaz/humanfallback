import type { NextRequest } from "next/server";
import { fail, ok, origin } from "@/lib/http";
import { currentUser } from "@/lib/session";
import { findTask, notify, pushEvent } from "@/lib/repo";
import { mutate } from "@/lib/store";
import { createOrder, paypalMode } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return fail("Sign in required", 401);
  const { id } = await ctx.params;

  const task = findTask(id);
  if (!task) return fail("Task not found", 404);
  if (task.buyerId !== user.id && user.role !== "admin") return fail("Not permitted", 403);
  if (task.status !== "awaiting_payment") return fail("This task is not awaiting payment.", 409);

  if (task.payment.orderId && task.payment.status === "awaiting_approval") {
    return ok({ orderId: task.payment.orderId, mode: task.payment.mode });
  }

  try {
    const order = await createOrder({
      amount: task.payment.total,
      currency: task.payment.currency,
      description: `${task.code} · ${task.title}`,
      referenceId: task.code,
      returnUrl: `${origin(req)}/tasks/${task.id}?paypal=return`,
      cancelUrl: `${origin(req)}/tasks/${task.id}`,
    });

    mutate(() => {
      task.payment.orderId = order.id;
      task.payment.mode = order.mode;
      task.payment.status = "awaiting_approval";
      task.payment.createdAt = new Date().toISOString();
      pushEvent(
        task,
        "payment_created",
        "customer",
        `Payment order ${order.id} created for $${task.payment.total.toFixed(2)} (${order.mode}).`,
      );
    });

    return ok({
      orderId: order.id,
      mode: order.mode,
      approveUrl: order.approveUrl ?? null,
      amount: task.payment.total,
      currency: task.payment.currency,
      taskCode: task.code,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the payment order";
    mutate(() => {
      task.payment.status = "failed";
      task.payment.error = message;
      pushEvent(task, "payment_failed", "system", message);
    });
    return fail(message, 502, { mode: paypalMode() });
  }
}
