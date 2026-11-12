import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Clock,
  Globe2,
  MapPin,
  ScanEye,
  Sparkles,
  Star,
} from "lucide-react";
import { currentUser } from "@/lib/session";
import { db } from "@/lib/store";
import { findTask } from "@/lib/repo";
import { CATEGORY_LABELS } from "@/types";
import { Avatar, Badge, SectionLabel, StatusPill } from "@/components/ui";
import { formatDate, usd } from "@/lib/money";

export default async function HumanProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const provider = db().users.find((u) => u.id === id && u.role === "provider");
  if (!provider) notFound();

  const work = db()
    .tasks.filter((t) => t.providerId === provider.id)
    .sort((a, b) => (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt))
    .slice(0, 5);

  return (
    <div>
      <Link
        href="/marketplace"
        className="mb-3 inline-flex items-center gap-1.5 px-1 text-[12px] text-muted transition hover:text-ink"
      >
        <ArrowLeft size={13} /> Back to marketplace
      </Link>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr]">
        <section className="card overflow-hidden p-0">
          <div className="relative h-[132px] brand-gradient">
            <div className="aurora" />
          </div>
          <div className="px-5 pb-5">
            <div className="-mt-9 flex items-end justify-between">
              <Avatar name={provider.name} tone={provider.tone} size={78} ring className="ring-4" />
              <Badge tone={provider.isAvailable ? "lime" : "neutral"}>
                {provider.isAvailable ? "Available now" : "Currently busy"}
              </Badge>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <h1 className="text-[24px] font-semibold tracking-[-0.03em]">{provider.name}</h1>
              {provider.verified ? <BadgeCheck size={17} className="text-forest" /> : null}
            </div>
            <p className="text-[12.5px] text-ink-2">{provider.headline}</p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} /> {provider.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star size={11} className="fill-amber text-amber" /> {provider.rating.toFixed(1)} (
                {provider.reviews})
              </span>
              <span className="inline-flex items-center gap-1">
                <Globe2 size={11} /> {provider.languages.join(", ")}
              </span>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-ink-2">{provider.bio}</p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "Tasks", value: String(provider.completedTasks) },
                { label: "Earned", value: usd(provider.earned, { cents: false }) },
                { label: "Rate", value: `$${provider.hourlyRate}/hr` },
              ].map((s) => (
                <div key={s.label} className="rounded-[14px] bg-[#faf8f3] px-3 py-2">
                  <p className="text-[10px] text-muted">{s.label}</p>
                  <p className="tnum mt-0.5 text-[14px] font-semibold">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <SectionLabel>Skills</SectionLabel>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {provider.skills.map((s) => (
                  <span key={s} className="rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-2">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <Link href="/workspace" className="btn btn-primary mt-5 w-full py-2.5">
              <Sparkles size={14} /> Ask the agent to hire {provider.name.split(" ")[0]}
            </Link>
          </div>
        </section>

        <div className="space-y-3">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>Services</SectionLabel>
              <span className="text-[11px] text-muted">{provider.services.length} listed</span>
            </div>
            <div className="mt-3 space-y-2">
              {provider.services.map((s) => (
                <div
                  key={s.id}
                  className="rounded-[18px] border border-line px-3.5 py-3 transition hover:border-[#ffcbb4]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-medium">{s.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted">{s.description}</p>
                    </div>
                    <p className="tnum shrink-0 text-[15px] font-semibold">${s.price}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[10.5px] text-muted">
                    <Badge tone="neutral">{CATEGORY_LABELS[s.category]}</Badge>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={10} /> {s.durationMins} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>Recent work</SectionLabel>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                <ScanEye size={11} /> AI verified
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              {work.length ? (
                work.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="flex items-center gap-3 rounded-[14px] px-2 py-2 transition hover:bg-[#faf7f2]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#faf7f2] text-ink-2">
                      <ScanEye size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium">{t.title}</p>
                      <p className="truncate text-[10.5px] text-muted">
                        {t.code} · {t.completedAt ? formatDate(t.completedAt) : "active"}
                      </p>
                    </div>
                    <StatusPill status={t.status} />
                  </Link>
                ))
              ) : (
                <p className="py-4 text-center text-[12px] text-muted">No public work history yet.</p>
              )}
            </div>
          </section>

          <section className="card flex items-center justify-between p-4">
            <div>
              <p className="text-[12.5px] font-medium">Need something else?</p>
              <p className="text-[11px] text-muted">The agent can scope it for you.</p>
            </div>
            <Link href="/workspace" className="btn btn-dark px-4 py-2 text-[12px]">
              Open workspace <ArrowUpRight size={13} />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
