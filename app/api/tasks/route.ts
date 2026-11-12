import type { NextRequest } from "next/server";
import type { Category, ProviderMatch } from "@/types";
import { CATEGORIES } from "@/types";
import { fail, ok } from "@/lib/http";
import { currentUser } from "@/lib/session";
import { db } from "@/lib/store";
import { createTask } from "@/lib/tasks";
import { tasksForUser } from "@/lib/repo";
import type { TaskDraft } from "@/lib/ai/agents";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return fail("Sign in required", 401);

  const status = req.nextUrl.searchParams.get("status");
  let tasks = tasksForUser(user);
  if (status && status !== "all") tasks = tasks.filter((t) => t.status === status);
  return ok({ tasks });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return fail("Sign in required", 401);
  if (user.role === "provider") return fail("Only customers can create tasks", 403);

  let body: { draft?: Partial<TaskDraft>; providerId?: string; matches?: ProviderMatch[] };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const draft = body.draft;
  if (!draft || !draft.title || !draft.category) return fail("A task draft is required", 422);
  if (!(CATEGORIES as readonly string[]).includes(draft.category)) {
    return fail("Unknown task category", 422);
  }
  if (!body.providerId) return fail("Choose a provider before creating the task", 422);

  const provider = db().users.find((u) => u.id === body.providerId && u.role === "provider");
  if (!provider) return fail("That provider no longer exists", 404);

  const normalized: TaskDraft = {
    humanRequired: true,
    title: String(draft.title).slice(0, 80),
    description: String(draft.description ?? draft.title).slice(0, 800),
    category: draft.category as Category,
    location: String(draft.location ?? user.location).slice(0, 200),
    budget: Math.max(5, Math.min(500, Number(draft.budget) || 20)),
    priority: (["low", "normal", "high", "urgent"] as const).includes(draft.priority as never)
      ? (draft.priority as TaskDraft["priority"])
      : "normal",
    instructions: String(draft.instructions ?? draft.title).slice(0, 2000),
    completionCriteria: (draft.completionCriteria ?? []).slice(0, 6).map(String),
    requiredEvidence: (draft.requiredEvidence ?? []).slice(0, 4).map(String),
    summary: String(draft.summary ?? draft.title).slice(0, 300),
    confidence: Math.max(0, Math.min(1, Number(draft.confidence) || 0.75)),
    missing: (draft.missing ?? []).slice(0, 5).map(String),
    model: String(draft.model ?? "unknown"),
    ms: Number(draft.ms) || 0,
    source: draft.source === "heuristic" ? "heuristic" : "agent",
  };

  const task = createTask({
    buyer: user,
    draft: normalized,
    providerId: body.providerId,
    matches: body.matches ?? [],
  });

  return ok({ task }, 201);
}
