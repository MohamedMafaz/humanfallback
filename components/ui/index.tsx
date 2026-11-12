"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const TONES: Record<string, string> = {
  sunset: "linear-gradient(140deg,#ffc09b 0%,#ff7a45 55%,#f1541a 100%)",
  citrus: "linear-gradient(140deg,#ffe6a3 0%,#f7b733 60%,#e08c12 100%)",
  mint: "linear-gradient(140deg,#dcf9b6 0%,#a4e35c 60%,#69c23a 100%)",
  ocean: "linear-gradient(140deg,#c8e8f6 0%,#6bb6d6 60%,#33809f 100%)",
  lilac: "linear-gradient(140deg,#e9dcf7 0%,#b79ada 60%,#8461b4 100%)",
  clay: "linear-gradient(140deg,#f3cdb5 0%,#d08a5f 60%,#a25a33 100%)",
  sand: "linear-gradient(140deg,#f7ecd8 0%,#dfc39a 60%,#b89163 100%)",
  berry: "linear-gradient(140deg,#f9c9da 0%,#e080a3 60%,#b54b72 100%)",
};

export function avatarGradient(tone: string): string {
  return TONES[tone] ?? TONES.sand;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  tone = "sand",
  size = 40,
  ring = false,
  className,
}: {
  name: string;
  tone?: string;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-white",
        ring && "ring-2 ring-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: avatarGradient(tone),
        fontSize: Math.max(11, size * 0.34),
        fontWeight: 600,
        letterSpacing: "-0.02em",
      }}
      aria-hidden
    >
      <span className="drop-shadow-sm">{initials(name)}</span>
    </span>
  );
}

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return <Tag className={cn("card p-5", className)}>{children}</Tag>;
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.14em] text-muted", className)}>
      {children}
    </p>
  );
}

const BADGE_TONES: Record<string, string> = {
  neutral: "bg-[#f3efe9] text-ink-2",
  brand: "bg-brand-soft text-brand-700",
  lime: "bg-lime-soft text-forest",
  amber: "bg-amber-soft text-amber",
  ocean: "bg-ocean-soft text-ocean",
  plum: "bg-plum-soft text-plum",
  danger: "bg-danger-soft text-danger",
  dark: "bg-ink text-white",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof BADGE_TONES | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium",
        BADGE_TONES[tone] ?? BADGE_TONES.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, { tone: string; label: string }> = {
  draft: { tone: "neutral", label: "Draft" },
  awaiting_payment: { tone: "amber", label: "Awaiting payment" },
  open: { tone: "lime", label: "Open" },
  assigned: { tone: "brand", label: "Assigned" },
  in_progress: { tone: "brand", label: "In progress" },
  submitted: { tone: "ocean", label: "Submitted" },
  ai_review: { tone: "plum", label: "AI review" },
  awaiting_confirmation: { tone: "amber", label: "Awaiting confirmation" },
  completed: { tone: "lime", label: "Completed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  disputed: { tone: "danger", label: "Disputed" },
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const meta = STATUS_TONE[status] ?? { tone: "neutral", label: status };
  return (
    <Badge tone={meta.tone} className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </Badge>
  );
}

export function StatTile({
  label,
  value,
  hint,
  accent,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card flex flex-col justify-between gap-4 p-5">
      <div className="flex items-start justify-between">
        <SectionLabel>{label}</SectionLabel>
        {icon ? <span className="text-muted">{icon}</span> : null}
      </div>
      <div>
        <div className="tnum text-[30px] leading-none font-semibold tracking-[-0.035em]">{value}</div>
        {hint ? <div className="mt-2 text-[12.5px] text-muted">{hint}</div> : null}
      </div>
      {accent ? <div className="h-1 w-full rounded-full" style={{ background: accent }} /> : null}
    </div>
  );
}

export function ProgressRing({
  value,
  size = 132,
  stroke = 12,
  label,
  sub,
  color = "#c9f26c",
  track = "#f0ebe3",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  sub?: ReactNode;
  color?: string;
  track?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="tnum text-[19px] font-semibold leading-none">{label ?? `${Math.round(pct)}%`}</span>
        {sub ? <span className="mt-1 text-[11px] leading-tight text-muted">{sub}</span> : null}
      </div>
    </div>
  );
}

export function BarMeter({
  items,
  className,
}: {
  items: { label: string; value: number; color: string; caption?: string }[];
  className?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-baseline justify-between text-[12.5px]">
            <span className="text-ink-2">{item.label}</span>
            <span className="tnum text-muted">{item.caption}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#f2ede6]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(3, (item.value / max) * 100)}%`, background: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full rounded-t-[28px] bg-white p-6 shadow-[0_40px_80px_-30px_rgba(23,19,15,0.5)] sm:rounded-[28px]"
        style={{ maxWidth: width }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[19px] font-semibold tracking-[-0.02em]">{title}</h3>
            {subtitle ? <p className="mt-1 text-[13px] text-muted">{subtitle}</p> : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted transition hover:bg-[#f3efe9] hover:text-ink"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[22px] border border-dashed border-line bg-[#fbf9f5] px-6 py-10 text-center">
      {icon ? <div className="text-muted">{icon}</div> : null}
      <div>
        <p className="text-[14.5px] font-medium">{title}</p>
        {body ? <p className="mt-1 max-w-sm text-[12.5px] text-muted">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("hairline my-4", className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4 w-full", className)} />;
}
