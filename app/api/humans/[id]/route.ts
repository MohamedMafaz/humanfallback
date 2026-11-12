import { fail, ok } from "@/lib/http";
import { db, publicUser } from "@/lib/store";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = db().users.find((u) => u.id === id && u.role === "provider");
  if (!user) return fail("Provider not found", 404);

  const completed = db()
    .tasks.filter((t) => t.providerId === id && t.status === "completed")
    .slice(0, 10);

  return ok({
    provider: publicUser(user),
    recentWork: completed.map((t) => ({
      id: t.id,
      code: t.code,
      title: t.title,
      category: t.category,
      price: t.price,
      completedAt: t.completedAt,
      verdict: t.verification?.verdict ?? null,
    })),
  });
}
