import type { NextRequest } from "next/server";
import type { Category } from "@/types";
import { fail, ok } from "@/lib/http";
import { currentUser } from "@/lib/session";
import { shortlist } from "@/lib/ai/agents";
import { db } from "@/lib/store";
import { aiConfigured, TEXT_MODEL } from "@/lib/ai/ollama";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return fail("Sign in required", 401);

  let body: {
    title?: string;
    category?: Category;
    location?: string;
    budget?: number;
    requiredEvidence?: string[];
    lat?: number;
    lng?: number;
  };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  const started = Date.now();
  const providers = db().users.filter((u) => u.role === "provider");

  const matches = await shortlist(
    {
      title: body.title ?? "On-site task",
      category: (body.category ?? "general_assistance") as Category,
      location: body.location ?? user.location,
      budget: Number(body.budget) || 20,
      lat: Number(body.lat) || user.lat,
      lng: Number(body.lng) || user.lng,
      requiredEvidence: body.requiredEvidence ?? [],
    },
    providers,
  );

  const view = matches.map((m) => {
    const p = providers.find((x) => x.id === m.providerId)!;
    return {
      ...m,
      provider: {
        id: p.id,
        name: p.name,
        headline: p.headline,
        tone: p.tone,
        rating: p.rating,
        reviews: p.reviews,
        completedTasks: p.completedTasks,
        verified: p.verified,
        location: p.location,
        skills: p.skills,
        services: p.services,
      },
    };
  });

  return ok({
    matches: view,
    ai: { configured: aiConfigured(), model: TEXT_MODEL, totalMs: Date.now() - started },
  });
}
