import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  Banknote,
  CircleDollarSign,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";
import { currentUser } from "@/lib/session";
import { db } from "@/lib/store";
import { findUser, platformStats } from "@/lib/repo";
import { CATEGORY_LABELS } from "@/types";
import { Avatar, Badge, SectionLabel, StatTile, StatusPill } from "@/components/ui";
import { PageHeader } from "@/components/shell/PageHeader";
import { AdminReset } from "@/components/admin/AdminReset";
import { timeAgo, usd } from "@/lib/money";

export const metadata = { title: "Operations · HumanFallback" };

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const data = db();
  const stats = platformStats();
  const tasks = [...data.tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 12);
  const failed = data.tasks.filter((t) => t.payment.status === "failed");

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Platform overview"
        subtitle="Marketplace health, payment reconciliation and evidence review across every agent delegation."
        actions={<AdminReset />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Gross volume"
          value={usd(stats.grossVolume)}
          hint={`${usd(stats.platformFees)} platform fees`}
          icon={<CircleDollarSign size={16} />}
          accent="linear-gradient(90deg,#ff8a5b,#ff5a1f)"
        />
        <StatTile
          label="Active tasks"
          value={String(stats.activeTasks)}
          hint={`${stats.totalTasks} tasks in total`}
          icon={<Activity size={16} />}
          accent="linear-gradient(90deg,#c9f26c,#7ed957)"
        />
        <StatTile
          label="Human providers"
          value={String(stats.providers)}
          hint={`${stats.customers} customer accounts`}
          icon={<Users size={16} />}
          accent="linear-gradient(90deg,#8ecae6,#33809f)"
        />
        <StatTile
          label="Verification rate"
          value={`${stats.verificationRate}%`}
          hint={`${stats.completedTasks} completed · ${stats.disputed} disputed`}
          icon={<BadgeCheck size={16} />}
          accent="linear-gradient(90deg,#d9c2f2,#9b7bc4)"
        />
      </div>

      <div className="mt-3 grid items-start gap-3 xl:grid-cols-[1.6fr_1fr]">
        <section className="card overflow-hidden p-0">
          <div className="flex items-center justify-between px-5 pt-5">
            <SectionLabel>All tasks</SectionLabel>
            <Link href="/tasks" className="text-[11px] text-brand hover:underline">
              Open list
            </Link>
          </div>

          <div className="mt-3">
            {tasks.map((task) => {
              const provider = findUser(task.providerId);
              const buyer = findUser(task.buyerId);
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center gap-3 border-t border-line-soft px-4 py-2.5 transition hover:bg-[#fffaf7] md:px-5"
                >
                  <span className="w-[62px] shrink-0 font-mono text-[10.5px] text-muted">{task.code}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium">{task.title}</p>
                    <p className="truncate text-[10px] text-muted">
                      {CATEGORY_LABELS[task.category]} · {buyer?.name ?? "—"} → {provider?.name ?? "unassigned"}
                    </p>
                  </div>
                  <span className="tnum hidden w-[64px] shrink-0 text-right text-[12px] font-medium sm:block">
                    {usd(task.total)}
                  </span>
                  <span className="shrink-0">
                    <StatusPill status={task.status} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="space-y-3">
          <section className="card p-5">
            <SectionLabel>Payment reconciliation</SectionLabel>
            <div className="mt-3 space-y-2">
              {[
                { label: "Captured", value: stats.capturedPayments, tone: "lime" as const },
                { label: "Failed", value: stats.failedPayments, tone: "danger" as const },
                { label: "Disputed tasks", value: stats.disputed, tone: "amber" as const },
                { label: "Avg. ticket", value: usd(stats.avgTicket), tone: "neutral" as const },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-[14px] bg-[#faf8f3] px-3 py-2">
                  <span className="text-[11.5px] text-ink-2">{row.label}</span>
                  <Badge tone={row.tone}>{row.value}</Badge>
                </div>
              ))}
            </div>

            {failed.length ? (
              <div className="mt-3 rounded-[14px] bg-danger-soft px-3 py-2">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-danger">
                  <TriangleAlert size={11} /> {failed.length} failed capture(s)
                </p>
                <p className="mt-0.5 text-[10.5px] text-danger/80">
                  These tasks never released to a provider.
                </p>
              </div>
            ) : null}
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>Recent activity</SectionLabel>
              <span className="inline-flex items-center gap-1 text-[10.5px] text-muted">
                <ShieldCheck size={10} /> audited
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {data.activity.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <div className="min-w-0">
                    <p className="text-[11.5px] leading-snug">
                      <span className="font-medium">{a.actor}</span> {a.action}
                    </p>
                    <p className="truncate text-[10px] text-muted">
                      {a.detail} · {timeAgo(a.at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <SectionLabel>Agent usage</SectionLabel>
            <div className="mt-2 space-y-1.5 text-[11.5px]">
              <div className="flex justify-between">
                <span className="text-muted">Text model</span>
                <span className="font-mono text-[10.5px]">
                  {process.env.OLLAMA_TEXT_MODEL ?? "minimax-m3.1-flash"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Vision model</span>
                <span className="font-mono text-[10.5px]">
                  {process.env.OLLAMA_VISION_MODEL ?? "gemma4:31b"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">AI configured</span>
                <Badge tone={process.env.OLLAMA_API_KEY ? "lime" : "neutral"}>
                  {process.env.OLLAMA_API_KEY ? "yes" : "fallback"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">PayPal mode</span>
                <Badge tone={process.env.PAYPAL_CLIENT_ID ? "lime" : "neutral"}>
                  {process.env.PAYPAL_CLIENT_ID ? "sandbox" : "simulator"}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-[14px] bg-[#faf8f3] px-3 py-2">
              <Banknote size={13} className="text-forest" />
              <p className="text-[10.5px] leading-snug text-muted">
                Providers are paid from the captured volume. Demo records only.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
