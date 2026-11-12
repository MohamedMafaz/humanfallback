import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CircleDollarSign,
  Clock,
  Plus,
  ScanEye,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { currentUser } from "@/lib/session";
import { db, publicUser } from "@/lib/store";
import { platformStats, tasksForUser, findUser } from "@/lib/repo";
import { CATEGORY_LABELS } from "@/types";
import { Avatar, Badge, BarMeter, EmptyState, ProgressRing, SectionLabel, StatusPill } from "@/components/ui";
import { PageHeader } from "@/components/shell/PageHeader";
import { timeAgo, usd } from "@/lib/money";

export const metadata = { title: "Dashboard · HumanFallback" };

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role === "provider") redirect("/provider");
  if (user.role === "admin") redirect("/admin");

  const data = db();
  const tasks = tasksForUser(user);
  const stats = platformStats();
  const spent = tasks
    .filter((t) => t.payment.status === "captured")
    .reduce((sum, t) => sum + t.payment.total, 0);
  const active = tasks.filter((t) =>
    ["open", "assigned", "in_progress", "submitted", "ai_review", "awaiting_confirmation"].includes(t.status),
  );
  const completed = tasks.filter((t) => t.status === "completed");
  const transactions = data.transactions.filter((t) => t.buyerId === user.id).slice(0, 5);
  const providers = data.users.filter((u) => u.role === "provider" && u.isAvailable).slice(0, 3);

  const byCategory = Object.entries(
    tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.payment.total;
      return acc;
    }, {}),
  )
    .map(([category, value]) => ({
      category,
      value: Math.round(value * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  const ringColors = ["#c9f26c", "#ff8a5b", "#8ecae6", "#c9a6e9"];

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title={`Good to see you, ${user.name.split(" ")[0]}`}
        subtitle="Your agent’s physical-world work, payments and evidence in one place."
        actions={
          <Link href="/workspace" className="btn btn-primary">
            <Plus size={14} /> Delegate a task
          </Link>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[1.45fr_1fr]">
        {/* Balance / spend card */}
        <section className="card relative overflow-hidden p-5 md:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-2">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" /> USD
              </span>
              <span className="rounded-full bg-[#f3efe9] px-2.5 py-1 text-[11px] text-muted">Sandbox</span>
            </div>
            <span className="text-[11px] text-muted">
              Agent account · {user.id.replace("u_", "HF-").toUpperCase().slice(0, 9)}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-[11.5px] text-muted">Spent on real-world work</p>
            <div className="mt-1 flex items-end gap-3">
              <p className="tnum text-[44px] font-semibold leading-none tracking-[-0.045em] md:text-[54px]">
                {usd(spent)}
              </p>
              <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-lime-soft px-2 py-1 text-[10.5px] font-medium text-forest">
                <TrendingUp size={10} /> {completed.length} completed
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link href="/workspace" className="btn btn-dark px-4 py-2.5 text-[12.5px]">
              <Sparkles size={13} /> New delegation
            </Link>
            <Link href="/transactions" className="btn btn-ghost px-4 py-2.5 text-[12.5px]">
              <CircleDollarSign size={13} /> Transactions
            </Link>
            <Link
              href="/marketplace"
              className="ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-lime text-forest transition hover:bg-[#d6f98a]"
              aria-label="Browse marketplace"
            >
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line-soft pt-4">
            {[
              { label: "Active tasks", value: String(active.length) },
              { label: "Success rate", value: `${completed.length ? 100 : 0}%` },
              { label: "Avg. task", value: usd(stats.avgTicket, { cents: false }) },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[10.5px] text-muted">{s.label}</p>
                <p className="tnum mt-0.5 text-[17px] font-semibold">{s.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rewards-style lime card */}
        <section className="relative overflow-hidden rounded-[28px] lime-gradient p-5 md:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
          <svg
            className="pointer-events-none absolute -right-8 top-20 h-44 w-44 text-white/30"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
          </svg>
          <div className="relative flex h-full flex-col">
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-[10.5px] font-semibold tracking-[0.06em] text-lime">
                EVIDENCE ENGINE
              </span>
              <span className="text-[10.5px] text-forest/60">last 30 days</span>
            </div>

            <div className="mt-6">
              <p className="text-[11.5px] text-forest/70">Verification confidence</p>
              <div className="mt-1 flex items-end gap-2">
                <p className="tnum text-[40px] font-semibold leading-none tracking-[-0.04em] text-forest">
                  {stats.verificationRate}%
                </p>
                <span className="mb-1 rounded-full bg-white/60 px-2 py-1 text-[10px] font-medium text-forest">
                  verified verdicts
                </span>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
              <div className="rounded-[16px] bg-white/55 px-3 py-2.5">
                <p className="text-[10px] text-forest/60">Tasks completed</p>
                <p className="tnum mt-0.5 text-[17px] font-semibold text-forest">{completed.length}</p>
              </div>
              <div className="rounded-[16px] bg-white/55 px-3 py-2.5">
                <p className="text-[10px] text-forest/60">In review</p>
                <p className="tnum mt-0.5 text-[17px] font-semibold text-forest">
                  {tasks.filter((t) => ["submitted", "ai_review", "awaiting_confirmation"].includes(t.status)).length}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Row 2 */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.05fr_1.25fr]">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Spending</SectionLabel>
            <Badge tone="neutral">all time</Badge>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <ProgressRing
              value={byCategory[0] ? (byCategory[0].value / Math.max(1, spent)) * 100 : 0}
              size={132}
              stroke={13}
              label={usd(byCategory[0]?.value ?? 0, { cents: false })}
              sub={byCategory[0] ? CATEGORY_LABELS[byCategory[0].category as keyof typeof CATEGORY_LABELS] : "no spend"}
              color="#c9f26c"
            />
            <div className="min-w-0 flex-1 space-y-2">
              {byCategory.map((row, i) => (
                <div key={row.category} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: ringColors[i % ringColors.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-2">
                    {CATEGORY_LABELS[row.category as keyof typeof CATEGORY_LABELS]}
                  </span>
                  <span className="tnum text-[11.5px] text-muted">{usd(row.value, { cents: false })}</span>
                </div>
              ))}
              {!byCategory.length ? <p className="text-[12px] text-muted">No spend yet.</p> : null}
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Task mix</SectionLabel>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <Clock size={11} /> live
            </span>
          </div>
          <p className="tnum mt-3 text-[30px] font-semibold leading-none tracking-[-0.04em]">
            {tasks.length}
            <span className="ml-1.5 text-[12px] font-normal text-muted">tasks</span>
          </p>
          <p className="mt-1 text-[11.5px] text-forest">
            {completed.length} completed · {active.length} active
          </p>
          <div className="mt-5">
            <BarMeter
              items={byCategory.map((row, i) => ({
                label: CATEGORY_LABELS[row.category as keyof typeof CATEGORY_LABELS],
                value: row.value,
                color: ringColors[i % ringColors.length],
                caption: usd(row.value, { cents: false }),
              }))}
            />
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Transactions</SectionLabel>
            <Link href="/transactions" className="text-[11px] text-brand hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-1">
            {transactions.length ? (
              transactions.map((tx) => {
                const provider = findUser(tx.providerId);
                return (
                  <Link
                    key={tx.id}
                    href={`/tasks/${tx.taskId}`}
                    className="flex items-center gap-3 rounded-[14px] px-2 py-2 transition hover:bg-[#faf7f2]"
                  >
                    <Avatar name={provider?.name ?? "Human"} tone={provider?.tone ?? "sand"} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium">{tx.taskCode}</p>
                      <p className="truncate text-[10.5px] text-muted">
                        {provider?.name ?? "Provider"} · {timeAgo(tx.createdAt)}
                      </p>
                    </div>
                    <span className="tnum text-[12.5px] font-medium">−{usd(tx.total)}</span>
                  </Link>
                );
              })
            ) : (
              <p className="py-6 text-center text-[12px] text-muted">No payments yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Row 3 */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Active work</SectionLabel>
            <Link href="/tasks" className="text-[11px] text-brand hover:underline">
              All tasks
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {active.length ? (
              active.slice(0, 4).map((task) => {
                const provider = findUser(task.providerId);
                return (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center gap-3 rounded-[18px] border border-line-soft px-3 py-2.5 transition hover:border-[#ffcbb4] hover:bg-[#fffaf7]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#faf7f2] text-ink-2">
                      <ScanEye size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{task.title}</p>
                      <p className="truncate text-[10.5px] text-muted">
                        {task.code} · {provider?.name ?? "Unassigned"} · {usd(task.total)}
                      </p>
                    </div>
                    <StatusPill status={task.status} />
                  </Link>
                );
              })
            ) : (
              <EmptyState
                icon={<Sparkles size={18} />}
                title="No active work"
                body="Send the agent a request and it will hire a human for you."
                action={
                  <Link href="/workspace" className="btn btn-primary px-4 py-2 text-[12px]">
                    Open workspace
                  </Link>
                }
              />
            )}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Humans on call</SectionLabel>
            <Link href="/marketplace" className="text-[11px] text-brand hover:underline">
              Browse
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {providers.map((p) => (
              <Link
                key={p.id}
                href={`/humans/${p.id}`}
                className="flex items-center gap-3 rounded-[14px] px-2 py-2 transition hover:bg-[#faf7f2]"
              >
                <Avatar name={p.name} tone={p.tone} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium">{p.name}</p>
                  <p className="truncate text-[10.5px] text-muted">{p.headline}</p>
                </div>
                <span className="tnum text-[11.5px] text-forest">{p.rating.toFixed(1)}★</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
