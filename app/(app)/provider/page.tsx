import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Camera,
  ClipboardList,
  Clock,
  MapPin,
  Star,
} from "lucide-react";
import { currentUser } from "@/lib/session";
import { db } from "@/lib/store";
import { findUser } from "@/lib/repo";
import { Avatar, Badge, EmptyState, SectionLabel, StatusPill } from "@/components/ui";
import { PageHeader } from "@/components/shell/PageHeader";
import { timeAgo, usd } from "@/lib/money";

export const metadata = { title: "Provider desk · HumanFallback" };

export default async function ProviderPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "provider" && user.role !== "admin") redirect("/dashboard");

  const tasks = db().tasks.filter((t) => t.providerId === user.id);
  const incoming = tasks.filter((t) => t.status === "open");
  const active = tasks.filter((t) => ["assigned", "in_progress", "submitted", "ai_review"].includes(t.status));
  const awaiting = tasks.filter((t) => t.status === "awaiting_confirmation");
  const completed = tasks.filter((t) => t.status === "completed");
  const payable = completed.reduce((sum, t) => sum + t.price, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Provider"
        title={`Your desk, ${user.name.split(" ")[0]}`}
        subtitle="Tasks AI agents have delegated to you. Accept, complete on site, and upload the evidence the agent needs."
        actions={
          <Link href="/marketplace" className="btn btn-ghost">
            Browse marketplace <ArrowUpRight size={14} />
          </Link>
        }
      />

      <div className="grid items-start gap-3 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>Requests for you</SectionLabel>
              <Badge tone={incoming.length ? "brand" : "neutral"}>{incoming.length} new</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {incoming.length ? (
                incoming.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center gap-3 rounded-[18px] border border-line px-3.5 py-3 transition hover:border-[#ffcbb4] hover:bg-[#fffaf7]"
                  >
                    <Avatar name={findUser(task.buyerId)?.name ?? "Customer"} tone={findUser(task.buyerId)?.tone ?? "sand"} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{task.title}</p>
                      <p className="truncate text-[10.5px] text-muted">
                        {task.code} · {task.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="tnum text-[13px] font-semibold">{usd(task.price)}</p>
                      <p className="text-[10px] text-muted">your payout</p>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState
                  icon={<ClipboardList size={17} />}
                  title="No open requests"
                  body="When an agent matches you for a task, it appears here instantly."
                />
              )}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>In your hands</SectionLabel>
              <span className="text-[11px] text-muted">{active.length + awaiting.length} tasks</span>
            </div>
            <div className="mt-3 space-y-2">
              {[...active, ...awaiting].length ? (
                [...active, ...awaiting].map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center gap-3 rounded-[18px] border border-line-soft px-3.5 py-3 transition hover:border-[#ffcbb4] hover:bg-[#fffaf7]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#faf7f2] text-ink-2">
                      {task.evidence.length ? <Camera size={15} /> : <Clock size={15} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{task.title}</p>
                      <p className="truncate text-[10.5px] text-muted">
                        {task.evidence.length
                          ? `Evidence submitted · ${task.verification ? "AI reviewed" : "awaiting review"}`
                          : "Evidence not submitted yet"}
                      </p>
                    </div>
                    <StatusPill status={task.status} />
                  </Link>
                ))
              ) : (
                <EmptyState
                  icon={<Camera size={17} />}
                  title="Nothing in progress"
                  body="Accepted tasks and their evidence requirements show up here."
                />
              )}
            </div>
          </section>

          <section className="card p-5">
            <SectionLabel>Completed</SectionLabel>
            <div className="mt-3 space-y-1.5">
              {completed.length ? (
                completed.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center gap-3 rounded-[14px] px-2 py-2 transition hover:bg-[#faf7f2]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-lime-soft text-forest">
                      <BadgeCheck size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium">{task.title}</p>
                      <p className="truncate text-[10.5px] text-muted">
                        {task.code} · {task.completedAt ? timeAgo(task.completedAt) : ""}
                      </p>
                    </div>
                    <span className="tnum text-[12px] font-medium text-forest">+{usd(task.price)}</span>
                  </Link>
                ))
              ) : (
                <p className="py-4 text-center text-[12px] text-muted">Completed work will appear here.</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-3">
          <section className="relative overflow-hidden rounded-[28px] lime-gradient p-5">
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-[10.5px] font-semibold tracking-[0.06em] text-lime">
                PAYABLE
              </span>
              <p className="mt-5 text-[11.5px] text-forest/70">Confirmed earnings</p>
              <p className="tnum text-[38px] font-semibold leading-none tracking-[-0.04em] text-forest">
                {usd(payable)}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-[16px] bg-white/55 px-3 py-2.5">
                  <p className="text-[10px] text-forest/60">Completed</p>
                  <p className="tnum mt-0.5 text-[17px] font-semibold text-forest">{completed.length}</p>
                </div>
                <div className="rounded-[16px] bg-white/55 px-3 py-2.5">
                  <p className="text-[10px] text-forest/60">Payout model</p>
                  <p className="mt-0.5 text-[12px] font-semibold text-forest">Daily transfer</p>
                </div>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-forest/60">
                Demo environment: payouts are recorded, not transferred. Real disbursement needs a
                supported PayPal payout arrangement.
              </p>
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} tone={user.tone} size={48} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[14px] font-semibold">{user.name}</p>
                  {user.verified ? <BadgeCheck size={14} className="text-forest" /> : null}
                </div>
                <p className="truncate text-[11px] text-muted">{user.headline}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1">
                <Star size={10} className="fill-amber text-amber" /> {user.rating.toFixed(1)}
              </span>
              <span>{user.completedTasks} tasks</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={10} /> {user.location}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {user.skills.map((s) => (
                <span key={s} className="rounded-full bg-[#f5f1ea] px-2 py-0.5 text-[10.5px] text-ink-2">
                  {s}
                </span>
              ))}
            </div>
            <Link href={`/humans/${user.id}`} className="btn btn-ghost mt-4 w-full py-2 text-[12px]">
              View public profile
            </Link>
          </section>

          <section className="card p-4">
            <SectionLabel>Your services</SectionLabel>
            <div className="mt-2 space-y-2">
              {user.services.length ? (
                user.services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-[14px] bg-[#faf8f3] px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium">{s.title}</p>
                      <p className="text-[10px] text-muted">{s.durationMins} min</p>
                    </div>
                    <span className="tnum text-[12.5px] font-semibold">${s.price}</span>
                  </div>
                ))
              ) : (
                <p className="py-2 text-[12px] text-muted">No services listed yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
