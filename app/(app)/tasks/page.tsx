import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ClipboardList } from "lucide-react";
import { currentUser } from "@/lib/session";
import { tasksForUser, findUser } from "@/lib/repo";
import { Avatar, Badge, EmptyState, StatusPill } from "@/components/ui";
import { PageHeader } from "@/components/shell/PageHeader";
import { timeAgo, usd } from "@/lib/money";
import { CATEGORY_LABELS } from "@/types";

export const metadata = { title: "Tasks · HumanFallback" };

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "awaiting_confirmation", label: "Needs review" },
  { key: "completed", label: "Completed" },
  { key: "disputed", label: "Disputed" },
];

const ACTIVE = ["open", "assigned", "in_progress", "submitted", "ai_review"];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const { status = "all" } = await searchParams;

  let tasks = tasksForUser(user);
  if (status === "active") tasks = tasks.filter((t) => ACTIVE.includes(t.status));
  else if (status === "awaiting_confirmation")
    tasks = tasks.filter((t) => t.status === "awaiting_confirmation");
  else if (status === "completed") tasks = tasks.filter((t) => t.status === "completed");
  else if (status === "disputed") tasks = tasks.filter((t) => t.status === "disputed");

  tasks = [...tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div>
      <PageHeader
        eyebrow="Work"
        title="Tasks"
        subtitle="Every delegation, its payment state, evidence and verification verdict."
        actions={
          <Link href="/workspace" className="btn btn-primary">
            <ClipboardList size={14} /> New delegation
          </Link>
        }
      />

      <div className="mb-3 flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/tasks" : `/tasks?status=${tab.key}`}
            className="chip"
            data-active={status === tab.key}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <section className="card overflow-hidden p-0">
        <div className="hidden grid-cols-[1.8fr_0.9fr_0.7fr_0.7fr_0.5fr] items-center gap-3 border-b border-line-soft px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted md:grid">
          <span>Task</span>
          <span>Counterparty</span>
          <span>Status</span>
          <span>Amount</span>
          <span className="text-right">Updated</span>
        </div>

        {tasks.length ? (
          tasks.map((task) => {
            const other =
              user.role === "provider" ? findUser(task.buyerId) : findUser(task.providerId);
            return (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="grid grid-cols-1 items-center gap-3 border-b border-line-soft px-4 py-3.5 transition last:border-0 hover:bg-[#fffaf7] md:grid-cols-[1.8fr_0.9fr_0.7fr_0.7fr_0.5fr] md:px-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#faf7f2] text-ink-2">
                    <ClipboardList size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{task.title}</p>
                    <p className="truncate text-[10.5px] text-muted">
                      {task.code} · {CATEGORY_LABELS[task.category]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {other ? (
                    <>
                      <Avatar name={other.name} tone={other.tone} size={24} />
                      <span className="truncate text-[11.5px] text-ink-2">{other.name}</span>
                    </>
                  ) : (
                    <Badge tone="neutral">Unassigned</Badge>
                  )}
                </div>

                <div>
                  <StatusPill status={task.status} />
                </div>

                <div className="tnum text-[12.5px] font-medium">{usd(task.total)}</div>

                <div className="flex items-center justify-between md:justify-end">
                  <span className="text-[10.5px] text-muted">{timeAgo(task.updatedAt)}</span>
                  <ArrowUpRight size={13} className="ml-2 text-muted md:hidden" />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="p-5">
            <EmptyState
              icon={<ClipboardList size={18} />}
              title="Nothing here yet"
              body="Delegated tasks will show up in this list with their payment and evidence state."
              action={
                <Link href="/workspace" className="btn btn-primary px-4 py-2 text-[12px]">
                  Open workspace
                </Link>
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
