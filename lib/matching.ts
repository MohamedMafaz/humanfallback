import type { Category, ProviderMatch, Task, User } from "@/types";
import { distanceKm, quote } from "./money";

/** Capability vocabulary used to score a provider against a task category. */
export const CATEGORY_SKILLS: Record<Category, string[]> = {
  physical_inspection: ["meter", "inspection", "utility", "building", "property", "reading"],
  photography: ["photo", "camera", "visual", "video"],
  document_collection: ["document", "notary", "courier", "lease", "paperwork", "pickup"],
  local_errand: ["errand", "queue", "purchase", "return", "pickup", "delivery"],
  product_verification: ["product", "parcel", "price", "stock", "retail", "shelf", "verification"],
  inventory_audit: ["inventory", "audit", "sku", "warehouse", "count", "stock"],
  on_site_support: ["hardware", "network", "repair", "cabling", "server", "support"],
  general_assistance: ["assistance", "general", "help", "moving"],
};

export function providerPrice(provider: User, category: Category, budget: number): number {
  const service = provider.services.find((s) => s.category === category);
  if (service) return service.price;
  const estimate = Math.max(12, Math.round(provider.hourlyRate * 0.75));
  return Math.min(estimate, Math.max(12, budget));
}

function capabilityScore(provider: User, task: Task): number {
  if (provider.services.some((s) => s.category === task.category)) return 1;
  const vocab = CATEGORY_SKILLS[task.category] ?? [];
  const haystack = `${provider.skills.join(" ")} ${provider.headline} ${provider.bio}`.toLowerCase();
  const hits = vocab.filter((v) => haystack.includes(v)).length;
  if (hits >= 2) return 0.8;
  if (hits === 1) return 0.55;
  const titleWords = task.title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4);
  const titleHits = titleWords.filter((w) => haystack.includes(w)).length;
  if (titleHits > 0) return 0.4;
  return 0.12;
}

/**
 * Deterministic shortlist. Every number here comes from stored provider facts —
 * the language model only writes the narrative around them.
 */
export function rankProviders(
  task: Pick<Task, "lat" | "lng" | "category" | "budget" | "title" | "requiredEvidence">,
  providers: User[],
  limit = 3,
): ProviderMatch[] {
  const scored = providers
    .filter((p) => p.role === "provider" && p.isAvailable)
    .map((p) => {
      const distance = distanceKm({ lat: task.lat, lng: task.lng }, { lat: p.lat, lng: p.lng });
      const price = providerPrice(p, task.category, task.budget);
      const capability = capabilityScore(p, task as Task);
      const proximity = Math.max(0, 1 - distance / 12);
      const rating = Math.min(1, Math.max(0, (p.rating - 3.9) / 1.1));
      const priceFit = price <= task.budget ? 1 : Math.max(0.2, task.budget / price);
      const volume = Math.min(1, p.completedTasks / 50);
      const verified = p.verified ? 1 : 0.4;

      const score =
        100 *
        (0.33 * capability +
          0.22 * proximity +
          0.17 * rating +
          0.14 * priceFit +
          0.08 * volume +
          0.06 * verified);

      const service = p.services.find((s) => s.category === task.category);
      const reasons = [
        {
          label: `${distance.toFixed(1)} km from the task`,
          detail:
            distance < 2
              ? "Walking distance — can be on site within the hour."
              : distance < 5
                ? "Short ride across the city."
                : "Farther out, but available now.",
        },
        {
          label: service ? `Offers "${service.title}"` : `${p.skills.slice(0, 2).join(" · ")}`,
          detail: service
            ? `Listed at $${service.price} · ${service.durationMins} min`
            : `$${p.hourlyRate}/hr · ${p.completedTasks} tasks completed`,
        },
        {
          label: `${p.rating.toFixed(1)}★ from ${p.reviews} reviews`,
          detail: `${p.completedTasks} tasks completed on HumanFallback.`,
        },
      ];

      if (!p.verified) {
        reasons.push({
          label: "Identity not yet verified",
          detail: "Platform review pending — choose a verified provider for higher-trust work.",
        });
      }

      return {
        providerId: p.id,
        score: Math.round(score),
        distanceKm: distance,
        etaMins: Math.round(15 + distance * 4 + (service?.durationMins ?? 30)),
        price,
        reasons,
        rationale: "",
        source: "heuristic" as const,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((match) => {
    const q = quote(match.price);
    return {
      ...match,
      rationale: `${match.reasons[0].label}. ${match.reasons[1].label}. Estimated total $${q.total.toFixed(2)} including the 6% platform fee.`,
    };
  });
}

export function categoryFromText(text: string): Category {
  const t = text.toLowerCase();
  const rules: [Category, RegExp][] = [
    ["physical_inspection", /meter|electric|utility|inspect|reading|building|property|walkthrough/],
    ["inventory_audit", /inventory|stock count|sku|pallet|warehouse count|audit/],
    ["product_verification", /parcel|label|price tag|shelf|in stock|availability|seal|product/],
    ["document_collection", /document|lease|sign|notary|paperwork|collect.*(form|file)/],
    ["photography", /photo|picture|shoot|video|film/],
    ["local_errand", /errand|queue|pick up|pickup|deliver|buy|return/],
    ["on_site_support", /server|network|hardware|repair|install|cable/],
  ];
  for (const [category, pattern] of rules) if (pattern.test(t)) return category;
  return "general_assistance";
}

export function budgetFromText(text: string): number | null {
  const dollar = text.match(/\$\s?(\d+(?:\.\d{1,2})?)/);
  if (dollar) return Number(dollar[1]);
  const budgetWord = text.match(/budget\D{0,12}(\d+(?:\.\d{1,2})?)/i);
  if (budgetWord) return Number(budgetWord[1]);
  const upTo = text.match(/(?:up to|max|maximum)\s*(\d+(?:\.\d{1,2})?)/i);
  if (upTo) return Number(upTo[1]);
  return null;
}
