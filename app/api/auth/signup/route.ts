import type { NextRequest } from "next/server";
import type { Role, Tone, User } from "@/types";
import { fail, ok } from "@/lib/http";
import { hashPassword, id } from "@/lib/crypto";
import { findUserByEmail, logActivity } from "@/lib/repo";
import { setSessionCookie } from "@/lib/session";
import { mutate, publicUser } from "@/lib/store";

const TONES: Tone[] = ["sunset", "citrus", "mint", "ocean", "lilac", "clay", "sand", "berry"];

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    location?: string;
    skills?: string;
    headline?: string;
  };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const role: Role = body.role === "provider" ? "provider" : "customer";

  if (name.length < 2) return fail("Enter your name", 422);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Enter a valid email", 422);
  if (password.length < 8) return fail("Password must be at least 8 characters", 422);
  if (findUserByEmail(email)) return fail("An account with that email already exists", 409);

  const now = new Date().toISOString();
  const skills = (body.skills ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);

  const user: User = {
    id: id("u_"),
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    headline: body.headline?.trim() || (role === "provider" ? "Independent human provider" : "Agent owner"),
    bio: "",
    location: body.location?.trim() || "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    skills,
    languages: ["English"],
    hourlyRate: role === "provider" ? 30 : 0,
    rating: 5,
    reviews: 0,
    completedTasks: 0,
    earned: 0,
    isAvailable: role === "provider",
    verified: false,
    tone: TONES[Math.floor(Math.random() * TONES.length)],
    services: [],
    createdAt: now,
  };

  mutate((data) => {
    data.users.push(user);
  });
  logActivity(name, "Joined the marketplace", role === "provider" ? "Provider account" : "Customer account");
  await setSessionCookie(user.id);
  return ok({ user: publicUser(user) }, 201);
}
