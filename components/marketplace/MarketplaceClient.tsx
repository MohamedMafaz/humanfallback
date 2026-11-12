"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, MapPin, Search, Star } from "lucide-react";
import type { PublicUser } from "@/types";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/types";
import { Avatar, Badge, EmptyState } from "@/components/ui";
import { cn } from "@/lib/cn";

export function MarketplaceClient({ providers }: { providers: PublicUser[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (onlyAvailable && !p.isAvailable) return false;
      if (
        category !== "all" &&
        !p.services.some((s) => s.category === category) &&
        !p.skills.some((s) => s.toLowerCase().includes(category.replace("_", " ")))
      ) {
        return false;
      }
      if (!query) return true;
      const hay = `${p.name} ${p.headline} ${p.bio} ${p.skills.join(" ")} ${p.location}`.toLowerCase();
      return hay.includes(query.toLowerCase());
    });
  }, [providers, query, category, onlyAvailable]);

  return (
    <div>
      <div className="card mb-3 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-[#fbf9f5] px-3 py-2">
          <Search size={15} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, names or neighbourhoods"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#a9a199]"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 px-1 text-[12px] text-ink-2">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-line accent-[#ff5a1f]"
          />
          Available now
        </label>
        <span className="text-[11.5px] text-muted">{filtered.length} humans</span>
      </div>

      <div className="scroll-slim mb-3 flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setCategory("all")} className="chip" data-active={category === "all"}>
          All categories
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="chip"
            data-active={category === c}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            title="No humans match that filter"
            body="Try a broader category or clear the availability filter."
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const cheapest = p.services.reduce(
              (min, s) => (s.price < min ? s.price : min),
              p.services[0]?.price ?? p.hourlyRate,
            );
            return (
              <article key={p.id} className="card flex flex-col p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} tone={p.tone} size={46} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[14px] font-semibold">{p.name}</p>
                        {p.verified ? <BadgeCheck size={14} className="text-forest" /> : null}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted">{p.location}</p>
                    </div>
                  </div>
                  <Badge tone={p.isAvailable ? "lime" : "neutral"}>
                    {p.isAvailable ? "Available" : "Busy"}
                  </Badge>
                </div>

                <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-ink-2">{p.headline}</p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {p.skills.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-[#f5f1ea] px-2 py-0.5 text-[10.5px] text-ink-2"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1 rounded-[14px] bg-[#faf8f3] px-2.5 py-2">
                  <div>
                    <p className="text-[9.5px] uppercase tracking-wide text-muted">Rating</p>
                    <p className="tnum mt-0.5 inline-flex items-center gap-1 text-[12px] font-medium">
                      <Star size={9} className="fill-amber text-amber" /> {p.rating.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9.5px] uppercase tracking-wide text-muted">Tasks</p>
                    <p className="tnum mt-0.5 text-[12px] font-medium">{p.completedTasks}</p>
                  </div>
                  <div>
                    <p className="text-[9.5px] uppercase tracking-wide text-muted">From</p>
                    <p className="tnum mt-0.5 text-[12px] font-medium">${cheapest}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/humans/${p.id}`}
                    className={cn("btn btn-ghost flex-1 py-2 text-[12px]")}
                  >
                    View profile
                  </Link>
                  <Link
                    href="/workspace"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition hover:bg-ink/85"
                    aria-label={`Request ${p.name}`}
                  >
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
