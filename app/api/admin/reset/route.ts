import { fail, ok } from "@/lib/http";
import { currentUser } from "@/lib/session";
import { resetDB } from "@/lib/store";

export const runtime = "nodejs";

/** Restores the seeded demo dataset. Handy between demo takes. */
export async function POST() {
  const user = await currentUser();
  if (!user || user.role !== "admin") return fail("Admin access required", 403);
  const data = resetDB();
  return ok({ ok: true, seededAt: data.seededAt });
}
