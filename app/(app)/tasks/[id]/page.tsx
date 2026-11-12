import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CircleDollarSign,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  ScanEye,
  Sparkles,
  Star,
  TriangleAlert,
} from "lucide-react";
import { currentUser } from "@/lib/session";
import { findTask, findUser } from "@/lib/repo";
import { CATEGORY_LABELS, type TaskEvent } from "@/types";
import { Avatar, Badge, SectionLabel, StatusPill } from "@/components/ui";
import { TaskActions } from "@/components/tasks/TaskActions";
import { PayNowButton } from "@/components/tasks/PayNowButton";
import { PayPalReturn } from "@/components/tasks/PayPalReturn";
import { formatDate, formatTime, timeAgo, usd } from "@/lib/money";

export const metadata = { title: "Task · HumanFallback" };

const EVENT_ICON: Record<TaskEvent["type"], typeof Check> = {
  created: Sparkles,
  matched: ScanEye,
  proposal: FileText,
  payment_created: CreditCard,
  payment_captured: CircleDollarSign,
  payment_failed: TriangleAlert,
  accepted: BadgeCheck,
  started: Clock,
  evidence: FileText,
  ai_review: ScanEye,
  confirmed: Check,
  disputed: TriangleAlert,
  cancelled: TriangleAlert,
};

const VERDICT: Record<string, { label: string; tone: string }> = {
  verified: { label: "Verified", tone: "lime" },
  partially_verified: { label: "Partially verified", tone: "amber" },
  insufficient: { label: "More evidence needed", tone: "amber" },
  failed: { label: "Failed verification", tone: "danger" },
};

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paypal?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const { paypal } = await searchParams;

  const task = findTask(id);
  if (!task) notFound();
  if (user.role !== "admin" && task.buyerId !== user.id && task.providerId !== user.id) notFound();

  const buyer = findUser(task.buyerId);
  const provider = findUser(task.providerId);
  const isBuyer = user.id === task.buyerId;
  const verdict = task.verification ? VERDICT[task.verification.verdict] : null;

  return (
    <div>
      <Link
        href="/tasks"
        className="mb-3 inline-flex items-center gap-1.5 px-1 text-[12px] text-muted transition hover:text-ink"
      >
        <ArrowLeft size={13} /> All tasks
      </Link>

      {paypal === "return" ? <PayPalReturn taskId={task.id} /> : null}

      <div className="card mb-3 flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-muted">{task.code}</span>
            <StatusPill status={task.status} />
            <Badge tone="neutral">{CATEGORY_LABELS[task.category]}</Badge>
            {task.priority !== "normal" ? <Badge tone="brand">{task.priority}</Badge> : null}
          </div>
          <h1 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.035em] md:text-[28px]">
            {task.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} /> {task.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> created {timeAgo(task.createdAt)}
            </span>
            {task.completedAt ? <span>completed {formatDate(task.completedAt)}</span> : null}
          </div>
        </div>
        <div className="md:text-right">
          <p className="text-[10.5px] uppercase tracking-[0.12em] text-muted">Total paid</p>
          <p className="tnum text-[26px] font-semibold leading-tight">{usd(task.total)}</p>
          <p className="text-[11px] text-muted">
            {usd(task.price)} service + {usd(task.fee)} fee
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        {/* ------------- Main column ------------- */}
        <div className="space-y-3">
          <section className="card p-5">
            <SectionLabel>What was asked</SectionLabel>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{task.description}</p>

            <div className="mt-4 rounded-[18px] bg-[#faf8f3] p-3.5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                Instructions for the human
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink">
                {task.instructions}
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Completion criteria
                </p>
                <ul className="mt-2 space-y-1.5">
                  {task.completionCriteria.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-[12px] text-ink-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-soft text-forest">
                        <Check size={9} strokeWidth={3} />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Evidence required
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {task.requiredEvidence.map((e) => (
                    <Badge key={e} tone="ocean">
                      {e}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 rounded-[14px] border border-line px-3 py-2">
                  <p className="text-[10px] text-muted">Structured by</p>
                  <p className="text-[11.5px] font-medium">{task.agent.model}</p>
                  <p className="mt-0.5 text-[10.5px] text-muted">
                    {Math.round(task.agent.confidence * 100)}% extraction confidence
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Evidence */}
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>Evidence</SectionLabel>
              <span className="text-[11px] text-muted">{task.evidence.length} item(s)</span>
            </div>

            {task.evidence.length ? (
              <div className="mt-3 space-y-3">
                {task.evidence.map((e) => (
                  <div key={e.id} className="overflow-hidden rounded-[18px] border border-line">
                    {e.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={e.url}
                        alt={e.fileName}
                        className="max-h-[380px] w-full bg-[#f2efe9] object-contain"
                      />
                    ) : (
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-[#faf8f3] px-3 py-4 text-[12.5px]"
                      >
                        <FileText size={16} /> {e.fileName}
                      </a>
                    )}
                    <div className="flex items-start justify-between gap-3 bg-white px-3 py-2.5">
                      <div>
                        <p className="text-[11.5px] text-ink-2">{e.note || e.fileName}</p>
                        <p className="mt-0.5 text-[10px] text-muted">
                          {formatDate(e.uploadedAt)} · {formatTime(e.uploadedAt)} ·{" "}
                          {(e.sizeBytes / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <span className="rounded-full bg-[#f5f1ea] px-2 py-0.5 text-[10px] text-ink-2">
                        {e.kind}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-[18px] border border-dashed border-line bg-[#fbf9f5] px-4 py-8 text-center">
                <ScanEye size={18} className="mx-auto text-muted" />
                <p className="mt-2 text-[12.5px] font-medium">No evidence yet</p>
                <p className="text-[11px] text-muted">
                  {provider ? `${provider.name.split(" ")[0]} hasn’t submitted anything yet.` : "Assign a provider to begin."}
                </p>
              </div>
            )}
          </section>

          {/* Verification */}
          <section className="card overflow-hidden p-0">
            <div className="flex items-center justify-between px-5 pt-5">
              <SectionLabel>AI evidence verification</SectionLabel>
              {verdict ? <Badge tone={verdict.tone}>{verdict.label}</Badge> : <Badge tone="neutral">pending</Badge>}
            </div>

            {task.verification ? (
              <div className="px-5 pb-5 pt-3">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-[74px] w-[74px] shrink-0 items-center justify-center">
                    <svg width="74" height="74" className="-rotate-90">
                      <circle cx="37" cy="37" r="31" fill="none" stroke="#f0ebe3" strokeWidth="8" />
                      <circle
                        cx="37"
                        cy="37"
                        r="31"
                        fill="none"
                        stroke={task.verification.verdict === "verified" ? "#7ED957" : "#f0b429"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 31}
                        strokeDashoffset={
                          2 * Math.PI * 31 * (1 - task.verification.confidence)
                        }
                      />
                    </svg>
                    <span className="tnum absolute text-[15px] font-semibold">
                      {Math.round(task.verification.confidence * 100)}%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] leading-relaxed text-ink-2">
                      {task.verification.summary}
                    </p>
                    <p className="mt-1.5 text-[10.5px] text-muted">
                      Model {task.verification.model} · {timeAgo(task.verification.createdAt)} · advisory
                      only
                    </p>
                  </div>
                </div>

                {task.verification.missing.length ? (
                  <div className="mt-3 rounded-[14px] bg-amber-soft px-3 py-2">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-amber">
                      Missing requirements
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {task.verification.missing.map((m) => (
                        <li key={m} className="text-[11.5px] text-amber">
                          · {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {task.verification.extracted ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(task.verification.extracted).map(([k, v]) => (
                      <span
                        key={k}
                        className="rounded-full border border-line bg-[#fbf9f5] px-2.5 py-1 text-[10.5px] text-ink-2"
                      >
                        <span className="text-muted">{k}:</span> {String(v)}
                      </span>
                    ))}
                  </div>
                ) : null}

                <p className="mt-3 border-t border-line-soft pt-2.5 text-[10px] leading-relaxed text-muted">
                  Verification is advisory. It never authorises capture, refunds or completion on its own —
                  the customer confirms.
                </p>
              </div>
            ) : (
              <div className="px-5 pb-5 pt-2">
                <p className="text-[12px] leading-relaxed text-muted">
                  Once a photo is submitted, the vision model compares it against the completion criteria
                  and returns a verdict with a confidence score.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* ------------- Side column ------------- */}
        <div className="space-y-3">
          {/* People */}
          <section className="card p-4">
            <SectionLabel>People</SectionLabel>
            <div className="mt-3 space-y-2">
              {[
                { label: "Customer", person: buyer, href: null },
                { label: "Provider", person: provider, href: provider ? `/humans/${provider.id}` : null },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 rounded-[14px] bg-[#faf8f3] px-3 py-2.5">
                  {row.person ? (
                    <Avatar name={row.person.name} tone={row.person.tone} size={34} />
                  ) : (
                    <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-line text-[11px] text-muted">
                      ?
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] uppercase tracking-wide text-muted">{row.label}</p>
                    <p className="truncate text-[12.5px] font-medium">
                      {row.person?.name ?? "Not assigned"}
                    </p>
                  </div>
                  {row.href ? (
                    <Link href={row.href} className="text-muted transition hover:text-brand">
                      <ArrowUpRight size={14} />
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
            {provider ? (
              <div className="mt-2 flex items-center gap-3 px-1 text-[11px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <Star size={10} className="fill-amber text-amber" /> {provider.rating.toFixed(1)}
                </span>
                <span>{provider.completedTasks} tasks</span>
                {provider.verified ? (
                  <span className="inline-flex items-center gap-1 text-forest">
                    <BadgeCheck size={11} /> verified
                  </span>
                ) : null}
              </div>
            ) : null}
          </section>

          {/* Payment */}
          <section className="card p-4">
            <div className="flex items-center justify-between">
              <SectionLabel>Payment</SectionLabel>
              <Badge tone={task.payment.status === "captured" ? "lime" : task.payment.status === "failed" ? "danger" : "amber"}>
                {task.payment.status}
              </Badge>
            </div>

            <div className="mt-3 space-y-1.5 text-[11.5px]">
              <div className="flex justify-between text-ink-2">
                <span>Service</span>
                <span className="tnum">{usd(task.payment.amount)}</span>
              </div>
              <div className="flex justify-between text-ink-2">
                <span>Platform fee</span>
                <span className="tnum">{usd(task.payment.fee)}</span>
              </div>
              <div className="hairline my-1.5" />
              <div className="flex justify-between text-[13px] font-semibold">
                <span>Total</span>
                <span className="tnum">{usd(task.payment.total)}</span>
              </div>
            </div>

            <div className="mt-3 space-y-1 rounded-[12px] bg-[#faf8f3] px-3 py-2 text-[10.5px]">
              <div className="flex justify-between gap-2">
                <span className="text-muted">Mode</span>
                <span>{task.payment.mode === "paypal" ? "PayPal Sandbox" : "Sandbox simulator"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted">Order</span>
                <span className="truncate font-mono">{task.payment.orderId ?? "—"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted">Capture</span>
                <span className="truncate font-mono">{task.payment.captureId ?? "—"}</span>
              </div>
              {task.payment.capturedAt ? (
                <div className="flex justify-between gap-2">
                  <span className="text-muted">Captured</span>
                  <span>{formatDate(task.payment.capturedAt)}</span>
                </div>
              ) : null}
            </div>

            {isBuyer && task.status === "awaiting_payment" ? (
              <div className="mt-3">
                <PayNowButton
                  taskId={task.id}
                  total={task.total}
                  resumable={task.payment.status === "awaiting_approval"}
                />
              </div>
            ) : null}
          </section>

          {/* Actions */}
          <section className="card p-4">
            <SectionLabel>Actions</SectionLabel>
            <div className="mt-3">
              <TaskActions task={task} user={user} />
            </div>
          </section>

          {/* Timeline */}
          <section className="card p-4">
            <SectionLabel>Activity</SectionLabel>
            <div className="mt-3 space-y-0">
              {[...task.timeline].reverse().map((event, i, arr) => {
                const Icon = EVENT_ICON[event.type] ?? Check;
                return (
                  <div key={event.id} className="relative flex gap-3 pb-3 last:pb-0">
                    {i < arr.length - 1 ? (
                      <span className="absolute left-[11px] top-6 h-full w-px bg-line" />
                    ) : null}
                    <span className="relative z-10 mt-0.5 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-2">
                      <Icon size={10} />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[11.5px] leading-snug text-ink-2">{event.message}</p>
                      <p className="mt-0.5 text-[9.5px] text-muted">
                        {event.actor} · {timeAgo(event.at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
