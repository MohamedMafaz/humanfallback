import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { verifyPassword } from "@/lib/crypto";
import { findUserByEmail } from "@/lib/repo";
import { setSessionCookie } from "@/lib/session";
import { publicUser } from "@/lib/store";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  if (!email || !password) return fail("Email and password are required", 422);

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return fail("That email and password combination does not match an account.", 401);
  }
  await setSessionCookie(user.id);
  return ok({ user: publicUser(user) });
}
