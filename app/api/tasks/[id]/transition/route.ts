import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { currentUser } from "@/lib/session";
import { findTask } from "@/lib/repo";
import { applyAction, type LifecycleAction } from "@/lib/tasks";
import { mutate } from "@/lib/store";

const ACTIONS: LifecycleAction[] = ["accept", "start", "confirm", "dispute", "cancel"];

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return fail("Sign in required", 401);
  const { id } = await ctx.params;

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }
  const action = body.action as LifecycleAction;
  if (!ACTIONS.includes(action)) return fail("Unknown action", 422);

  const task = findTask(id);
  if (!task) return fail("Task not found", 404);

  const result = mutate(() => applyAction(task, action, user));
  if (!result.ok) return fail(result.error, 409);
  return ok({ task });
}
