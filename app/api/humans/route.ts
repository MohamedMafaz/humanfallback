import type { NextRequest } from "next/server";
import { ok } from "@/lib/http";
import { db, publicUser } from "@/lib/store";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").toLowerCase();
  const category = req.nextUrl.searchParams.get("category");
  const available = req.nextUrl.searchParams.get("available");
  const maxPrice = Number(req.nextUrl.searchParams.get("maxPrice") ?? 0);

  let providers = db().users.filter((u) => u.role === "provider");

  if (q) {
    providers = providers.filter((p) =>
      `${p.name} ${p.headline} ${p.bio} ${p.skills.join(" ")} ${p.location}`
        .toLowerCase()
        .includes(q),
    );
  }
  if (category && category !== "all") {
    providers = providers.filter(
      (p) => p.services.some((s) => s.category === category) || p.skills.some((s) => s.toLowerCase().includes(category)),
    );
  }
  if (available === "true") providers = providers.filter((p) => p.isAvailable);
  if (maxPrice > 0) {
    providers = providers.filter((p) =>
      p.services.length ? p.services.some((s) => s.price <= maxPrice) : p.hourlyRate <= maxPrice,
    );
  }

  return ok({
    providers: providers
      .sort((a, b) => b.rating - a.rating)
      .map((p) => publicUser(p)),
  });
}
