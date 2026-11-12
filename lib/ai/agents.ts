import {
  CATEGORIES,
  CATEGORY_LABELS,
  type Category,
  type ProviderMatch,
  type Task,
  type User,
  type Verification,
} from "@/types";
import { aiConfigured, jsonCall, TEXT_MODEL, VISION_MODEL } from "./ollama";
import { budgetFromText, categoryFromText, providerPrice, rankProviders } from "../matching";

export interface TaskDraft {
  humanRequired: boolean;
  title: string;
  description: string;
  category: Category;
  location: string;
  budget: number;
  priority: "low" | "normal" | "high" | "urgent";
  instructions: string;
  completionCriteria: string[];
  requiredEvidence: string[];
  summary: string;
  confidence: number;
  missing: string[];
  model: string;
  ms: number;
  source: "agent" | "heuristic";
}

const CATEGORY_LIST = CATEGORIES.map((c) => `- ${c}: ${CATEGORY_LABELS[c]}`).join("\n");

const UNDERSTAND_SYSTEM = `You are the Task Understanding Agent for HumanFallback, a marketplace where AI agents hire humans for physical-world work.

Given a user's request, decide whether it needs a human in the physical world, then convert it into a structured task.

Categories:
${CATEGORY_LIST}

Rules:
- "category" describes the nature of the WORK, not the evidence format. Reading a meter or inspecting a device is physical_inspection even though a photo is the evidence.
- Choosing a product in a shop, or photographing a parcel or price tag, is product_verification.
- Only use "photography" when the deliverable itself is photographs (a shoot, a walkthrough for images).

Reply with ONLY a JSON object, no markdown, using exactly these keys:
{
  "human_required": boolean,
  "title": string (max 60 chars, imperative),
  "description": string (2 sentences, neutral, written for a marketplace listing),
  "category": one of the category ids above,
  "location": string (use the provided default if the user gives none),
  "budget": number in USD (use the user's stated cap, otherwise a fair estimate),
  "priority": "low" | "normal" | "high" | "urgent",
  "instructions": string (clear step-by-step instructions for the human),
  "completion_criteria": string[] (3-5 testable criteria),
  "required_evidence": string[] (1-3 items, e.g. "Photograph of the meter display"),
  "summary": string (one sentence shown to the user),
  "confidence": number between 0 and 1,
  "missing": string[] (information the agent still needs; empty if none)
}`;

export interface UnderstandHints {
  location: string;
  budget?: number | null;
}

export async function understandTask(prompt: string, hints: UnderstandHints): Promise<TaskDraft> {
  const started = Date.now();
  const fallback = heuristicDraft(prompt, hints);

  if (!aiConfigured()) return fallback;

  const result = await jsonCall<Record<string, unknown>>({
    system: UNDERSTAND_SYSTEM,
    user: `Default location: ${hints.location}
${hints.budget ? `Budget cap: $${hints.budget}` : ""}
User request: """${prompt}"""`,
    maxTokens: 700,
    timeoutMs: 45_000,
  });

  if (!result.data) return { ...fallback, ms: Date.now() - started };

  const d = result.data;
  const rawCategory =
    typeof d.category === "string" && (CATEGORIES as readonly string[]).includes(d.category)
      ? (d.category as Category)
      : categoryFromText(prompt);
  const category = refineCategory(rawCategory, prompt);

  const budget = clampMoney(
    typeof d.budget === "number" ? d.budget : Number(d.budget) || hints.budget || fallback.budget,
  );

  return {
    humanRequired: d.human_required !== false,
    title: str(d.title, fallback.title).slice(0, 70),
    description: str(d.description, fallback.description),
    category,
    location: str(d.location, hints.location),
    budget,
    priority: ["low", "normal", "high", "urgent"].includes(String(d.priority))
      ? (d.priority as TaskDraft["priority"])
      : "normal",
    instructions: str(d.instructions, fallback.instructions),
    completionCriteria: arr(d.completion_criteria, fallback.completionCriteria),
    requiredEvidence: arr(d.required_evidence, fallback.requiredEvidence),
    summary: str(d.summary, fallback.summary),
    confidence: clamp01(Number(d.confidence) || 0.85),
    missing: arr(d.missing, []),
    model: result.model || TEXT_MODEL,
    ms: result.ms,
    source: "agent",
  };
}

export function heuristicDraft(prompt: string, hints: UnderstandHints): TaskDraft {
  const category = categoryFromText(prompt);
  const budget = clampMoney(budgetFromText(prompt) ?? hints.budget ?? defaultBudget(category));
  const subject = prompt.replace(/\s+/g, " ").trim().slice(0, 120);
  const label = CATEGORY_LABELS[category];
  return {
    humanRequired: true,
    title: titleFor(category, subject),
    description: `${subject} This requires a person on site, so the agent delegated it to a verified HumanFallback provider.`,
    category,
    location: hints.location,
    budget,
    priority: /urgent|asap|immediately|today/i.test(prompt) ? "high" : "normal",
    instructions: subject,
    completionCriteria: [
      "Work completed at the stated location",
      "Evidence matches the instructions",
      "Report is submitted through HumanFallback",
    ],
    requiredEvidence: [evidenceFor(category)],
    summary: `I cannot do this myself — it is a ${label.toLowerCase()} task. Here are humans who can.`,
    confidence: 0.7,
    missing: [],
    model: "heuristic",
    ms: 0,
    source: "heuristic",
  };
}

/**
 * Keeps the model honest on category: "photograph the meter" is an inspection
 * task, not a photography job. Only overrides when the prompt is unambiguous.
 */
function refineCategory(modelCategory: Category, prompt: string): Category {
  const hinted = categoryFromText(prompt);
  if (hinted === modelCategory) return modelCategory;

  const inspectionLanguage = /meter|electricity|utility|inspect|reading|walkthrough|property condition/i;
  if (modelCategory === "photography" && hinted === "physical_inspection" && inspectionLanguage.test(prompt)) {
    return "physical_inspection";
  }
  if (modelCategory === "general_assistance" && hinted !== "general_assistance") return hinted;
  return modelCategory;
}

function titleFor(category: Category, prompt: string): string {  const subject = prompt.replace(/^(please\s+)?(go to|check|find|take|collect|visit)\s+/i, "");
  const short = subject.split(/[.,]/)[0].slice(0, 52).trim();
  const prefixes: Record<Category, string> = {
    physical_inspection: "Inspect",
    photography: "Photograph",
    document_collection: "Collect",
    local_errand: "Run errand:",
    product_verification: "Verify",
    inventory_audit: "Count stock:",
    on_site_support: "Check on site:",
    general_assistance: "Assist with",
  };
  return `${prefixes[category]} ${short || "on-site task"}`.slice(0, 70);
}

function evidenceFor(category: Category): string {
  switch (category) {
    case "physical_inspection":
      return "Photograph of the item being inspected";
    case "photography":
      return "The requested photographs";
    case "document_collection":
      return "Photograph of the collected document";
    case "inventory_audit":
      return "Shelf photographs and a count per SKU";
    case "product_verification":
      return "Photograph of the product and price tag";
    case "on_site_support":
      return "Photograph of the equipment after the check";
    default:
      return "Photo evidence of completion";
  }
}

function defaultBudget(category: Category): number {
  const map: Record<Category, number> = {
    physical_inspection: 15,
    photography: 25,
    document_collection: 24,
    local_errand: 20,
    product_verification: 18,
    inventory_audit: 50,
    on_site_support: 60,
    general_assistance: 20,
  };
  return map[category];
}

function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function arr(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const cleaned = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
    if (cleaned.length) return cleaned.slice(0, 6);
  }
  return fallback;
}
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Math.round(n * 100) / 100));
}
function clampMoney(n: number): number {
  return Math.max(5, Math.min(500, Math.round(n * 100) / 100));
}

/**
 * Narrative layer for the shortlist. Provider facts (distance, price, rating)
 * are computed deterministically; the model only explains the shortlist and is
 * forbidden from inventing attributes.
 */
export async function explainMatches(
  task: { title: string; category: Category; location: string; budget: number },
  matches: ProviderMatch[],
  providers: User[],
): Promise<ProviderMatch[]> {
  if (!matches.length || !aiConfigured()) return matches;

  const candidates = matches.map((m) => {
    const p = providers.find((x) => x.id === m.providerId)!;
    return {
      provider_id: m.providerId,
      name: p.name,
      headline: p.headline,
      skills: p.skills,
      distance_km: m.distanceKm,
      price_usd: m.price,
      rating: p.rating,
      reviews: p.reviews,
      completed_tasks: p.completedTasks,
      verified: p.verified,
      services: p.services.map((s) => s.title),
      score: m.score,
    };
  });

  const result = await jsonCall<{ matches?: { provider_id?: string; rationale?: string }[] }>({
    system: `You are the Provider Discovery Agent for HumanFallback. Write one factual sentence per candidate explaining why they suit the task. Use ONLY the supplied facts. Never invent experience, availability or location. Max 32 words per sentence. Return ONLY JSON: {"matches":[{"provider_id":"...","rationale":"..."}]}`,
    user: `Task: ${task.title} (${task.category}) at ${task.location}, budget $${task.budget}.
Candidates: ${JSON.stringify(candidates)}`,
    maxTokens: 450,
    timeoutMs: 40_000,
  });

  const byId = new Map(
    (result.data?.matches ?? [])
      .filter((m) => m.provider_id && m.rationale)
      .map((m) => [m.provider_id!, String(m.rationale).trim()]),
  );

  return matches.map((m) => {
    const rationale = byId.get(m.providerId);
    return rationale ? { ...m, rationale, source: "agent" } : m;
  });
}

export async function shortlist(
  task: Pick<Task, "lat" | "lng" | "category" | "budget" | "title" | "requiredEvidence" | "location">,
  providers: User[],
): Promise<ProviderMatch[]> {
  const matches = rankProviders(task, providers, 3);
  if (!matches.length) return matches;
  return explainMatches(
    { title: task.title, category: task.category, location: task.location, budget: task.budget },
    matches,
    providers,
  );
}

export interface VerificationInput {
  task: Pick<Task, "title" | "instructions" | "completionCriteria" | "requiredEvidence" | "category">;
  images: string[];
  note?: string;
  providerName?: string;
}

export async function verifyEvidence(input: VerificationInput): Promise<Verification> {
  const started = new Date().toISOString();
  const base: Omit<Verification, "verdict" | "confidence" | "summary" | "missing" | "extracted" | "model"> = {
    id: `v_${Date.now().toString(36)}`,
    advisory: true,
    createdAt: started,
  };

  if (!input.images.length) {
    return {
      ...base,
      verdict: "insufficient",
      confidence: 0.2,
      summary:
        "No image evidence was submitted. The task requires a photograph, so the agent cannot verify completion yet.",
      missing: input.task.requiredEvidence,
      extracted: null,
      model: "rules",
    };
  }

  if (!aiConfigured()) {
    return {
      ...base,
      verdict: "partially_verified",
      confidence: 0.45,
      summary:
        "Image received. Automated vision review is unavailable (no model key configured), so a human reviewer should confirm the details.",
      missing: [],
      extracted: null,
      model: "rules",
    };
  }

  const result = await jsonCall<Record<string, unknown>>({
    system: `You are the Evidence Verification Agent for HumanFallback. Judge whether submitted photos satisfy the task. Be strict but fair. If the image is not a real photograph of the requested subject, say so. Return ONLY JSON:
{"verdict":"verified|partially_verified|insufficient|failed","confidence":0-1,"summary":"2-3 sentences","missing":["..."],"extracted":{"key":"value"}}`,
    user: `Task: ${input.task.title}
Instructions: ${input.task.instructions}
Completion criteria: ${input.task.completionCriteria.join("; ")}
Required evidence: ${input.task.requiredEvidence.join("; ")}
${input.note ? `Provider note: ${input.note}` : ""}
Evaluate the attached photo(s).`,
    images: input.images.slice(0, 3),
    model: VISION_MODEL,
    maxTokens: 550,
    timeoutMs: 60_000,
  });

  if (!result.data) {
    return {
      ...base,
      verdict: "partially_verified",
      confidence: 0.4,
      summary:
        "Evidence was stored and attached to the task, but the vision review could not complete. Manual confirmation is recommended.",
      missing: [],
      extracted: null,
      model: VISION_MODEL,
    };
  }

  const verdicts = ["verified", "partially_verified", "insufficient", "failed"] as const;
  const verdict = verdicts.includes(result.data.verdict as never)
    ? (result.data.verdict as Verification["verdict"])
    : "partially_verified";

  return {
    ...base,
    verdict,
    confidence: clamp01(Number(result.data.confidence) || 0.5),
    summary: str(result.data.summary, "Evidence reviewed by the verification agent."),
    missing: arr(result.data.missing, []),
    extracted:
      result.data.extracted && typeof result.data.extracted === "object"
        ? (result.data.extracted as Record<string, string>)
        : null,
    model: result.model,
  };
}

export function estimatePriceFor(task: { category: Category; budget: number }, provider: User): number {
  return providerPrice(provider, task.category, task.budget);
}
