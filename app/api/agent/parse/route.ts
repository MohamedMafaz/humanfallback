import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { currentUser } from "@/lib/session";
import { understandTask } from "@/lib/ai/agents";
import { aiConfigured, TEXT_MODEL } from "@/lib/ai/ollama";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return fail("Sign in required", 401);

  let body: { prompt?: string; location?: string; budget?: number | null };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const prompt = (body.prompt ?? "").trim();
  if (prompt.length < 8) {
    return fail("Describe the task in a little more detail.", 422);
  }

  const started = Date.now();
  const draft = await understandTask(prompt, {
    location: body.location?.trim() || user.location,
    budget: typeof body.budget === "number" && body.budget > 0 ? body.budget : null,
  });

  return ok({
    draft,
    ai: { configured: aiConfigured(), model: draft.model || TEXT_MODEL, totalMs: Date.now() - started },
  });
}
