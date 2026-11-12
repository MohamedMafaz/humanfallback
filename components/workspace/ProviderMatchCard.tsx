"use client";

import type { ProviderMatch } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { Avatar, Badge } from "@/components/ui";
import { usd } from "@/lib/money";
import { Check, MapPin, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/cn";

export interface MatchView extends ProviderMatch {
  provider: {
    id: string;
    name: string;
    headline: string;
    tone: string;
    rating: number;
    reviews: number;
    completedTasks: number;
    verified: boolean;
    location: string;
    skills: string[];
    services: { id: string; title: string; category: string; price: number; durationMins: number }[];
  };
}

export function ProviderMatchCard({
  match,
  selected,
  onSelect,
  rank,
}: {
  match: MatchView;
  selected: boolean;
  onSelect: () => void;
  rank: number;
}) {
  const p = match.provider;
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full rounded-[20px] border p-3.5 text-left transition",
        selected
          ? "border-brand bg-brand-tint/60 shadow-[0_0_0_3px_rgba(255,90,31,0.12)]"
          : "border-line bg-white hover:border-[#ffcbb4] hover:bg-[#fffaf7]",
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar name={p.name} tone={p.tone} size={42} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[13.5px] font-medium">{p.name}</p>
            {p.verified ? <ShieldCheck size={13} className="shrink-0 text-forest" /> : null}
            {rank === 1 ? <Badge tone="lime">Best fit</Badge> : null}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[11.5px] text-muted">{p.headline}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Star size={10} className="fill-amber text-amber" /> {p.rating.toFixed(1)}
              <span className="text-muted/70">({p.reviews})</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={10} /> {match.distanceKm.toFixed(1)} km
            </span>
            <span>{p.completedTasks} tasks</span>
          </div>
        </div>
        <div className="text-right">
          <p className="tnum text-[14px] font-semibold">{usd(match.price, { cents: false })}</p>
          <p className="text-[10px] text-muted">est. total {usd(match.price * 1.06)}</p>
        </div>
      </div>

      <div className="mt-3 rounded-[14px] bg-[#faf8f3] px-3 py-2.5">
        <p className="text-[11.5px] leading-relaxed text-ink-2">
          <span className="font-medium text-ink">Why this human: </span>
          {match.rationale}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge tone="neutral">
            {CATEGORY_LABELS[match.provider.services[0]?.category as keyof typeof CATEGORY_LABELS] ??
              "General"}
          </Badge>
          <Badge tone="neutral">ETA {match.etaMins} min</Badge>
          {match.source === "agent" ? <Badge tone="brand">Agent rationale</Badge> : null}
        </div>
      </div>

      {selected ? (
        <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] font-medium text-brand">
          <Check size={12} strokeWidth={3} /> Selected
        </div>
      ) : null}
    </button>
  );
}
