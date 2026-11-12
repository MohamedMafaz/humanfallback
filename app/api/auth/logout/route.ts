import { ok } from "@/lib/http";
import { clearSessionCookie } from "@/lib/session";

export async function POST() {
  await clearSessionCookie();
  return ok({ ok: true });
}
