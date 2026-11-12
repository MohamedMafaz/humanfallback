import { fail, ok } from "@/lib/http";
import { currentUser } from "@/lib/session";
import { findTask } from "@/lib/repo";
import { publicTaskView } from "@/lib/tasks";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return fail("Sign in required", 401);
  const { id } = await ctx.params;
  const task = findTask(id);
  if (!task) return fail("Task not found", 404);
  if (
    user.role !== "admin" &&
    task.buyerId !== user.id &&
    task.providerId !== user.id
  ) {
    return fail("Not permitted", 403);
  }
  return ok({ task: publicTaskView(task) });
}
