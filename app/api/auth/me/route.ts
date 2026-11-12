import { ok } from "@/lib/http";
import { currentUser } from "@/lib/session";
import { publicUser } from "@/lib/store";

export async function GET() {
  const user = await currentUser();
  return ok({ user: user ? publicUser(user) : null });
}
