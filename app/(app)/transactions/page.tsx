import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CircleDollarSign, CreditCard, Receipt } from "lucide-react";
import { currentUser } from "@/lib/session";
import { db } from "@/lib/store";
import { findUser } from "@/lib/repo";
import { Avatar, Badge, EmptyState, SectionLabel, StatTile } from "@/components/ui";
import { PageHeader } from "@/components/shell/PageHeader";
import { formatDate, formatTime, usd } from "@/lib/money";

export const metadata = { title: "Transactions · HumanFallback" };

export default async function TransactionsPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const all = db().transactions;
  const rows =
    user.role === "admin"
      ? all
      : all.filter((t) => t.buyerId === user.id || t.providerId === user.id);

  const captured = rows.filter((r) => r.status === "captured");
  const volume = captured.reduce((sum, r) => sum + r.total, 0);
  const fees = captured.reduce((sum, r) => sum + r.fee, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Money"
        title="Transactions"
        subtitle="Every PayPal order and capture tied to a delegated task, with the reference IDs needed for reconciliation."
        actions={
          <Badge tone="neutral">
            <CreditCard size={11} /> PayPal Sandbox
          </Badge>
        }
      />

      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Captured volume"
          value={usd(volume)}
          hint={`${captured.length} successful capture${captured.length === 1 ? "" : "s"}`}
          icon={<CircleDollarSign size={16} />}
          accent="linear-gradient(90deg,#ff8a5b,#ff5a1f)"
        />
        <StatTile
          label="Platform fees"
          value={usd(fees)}
          hint="6% of the service price"
          icon={<Receipt size={16} />}
          accent="linear-gradient(90deg,#c9f26c,#7ed957)"
        />
        <StatTile
          label="Transactions"
          value={String(rows.length)}
          hint="Orders created against tasks"
          icon={<CreditCard size={16} />}
          accent="linear-gradient(90deg,#8ecae6,#33809f)"
        />
      </div>

      <section className="card overflow-hidden p-0">
        <div className="hidden grid-cols-[1.4fr_1.1fr_0.8fr_1.2fr_0.7fr_0.6fr] gap-3 border-b border-line-soft px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted lg:grid">
          <span>Task</span>
          <span>Counterparty</span>
          <span>Mode</span>
          <span>Order / capture</span>
          <span>Amount</span>
          <span>Status</span>
        </div>

        {rows.length ? (
          rows.map((tx) => {
            const other = findUser(
              tx.buyerId === user.id ? tx.providerId : tx.buyerId,
            );
            return (
              <div
                key={tx.id}
                className="grid grid-cols-1 items-center gap-2 border-b border-line-soft px-4 py-3 transition last:border-0 hover:bg-[#fffaf7] md:grid-cols-2 lg:grid-cols-[1.4fr_1.1fr_0.8fr_1.2fr_0.7fr_0.6fr] lg:px-5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#faf7f2] text-ink-2">
                    <Receipt size={13} />
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/tasks/${tx.taskId}`}
                      className="flex items-center gap-1 truncate text-[12.5px] font-medium hover:text-brand"
                    >
                      {tx.taskCode} <ArrowUpRight size={11} />
                    </Link>
                    <p className="truncate text-[10px] text-muted">
                      {formatDate(tx.createdAt)} · {formatTime(tx.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {other ? (
                    <>
                      <Avatar name={other.name} tone={other.tone} size={22} />
                      <span className="truncate text-[11.5px] text-ink-2">{other.name}</span>
                    </>
                  ) : (
                    <span className="text-[11.5px] text-muted">—</span>
                  )}
                </div>

                <div>
                  <Badge tone={tx.mode === "paypal" ? "lime" : "neutral"}>
                    {tx.mode === "paypal" ? "PayPal" : "Simulator"}
                  </Badge>
                </div>

                <div className="min-w-0 text-[10.5px] font-mono text-muted">
                  <p className="truncate">{tx.orderId ?? "—"}</p>
                  <p className="truncate">{tx.captureId ?? "—"}</p>
                </div>

                <div className="tnum text-[12.5px] font-medium">
                  {usd(tx.total)}
                  <span className="ml-1 text-[10px] font-normal text-muted">
                    (fee {usd(tx.fee)})
                  </span>
                </div>

                <div>
                  <Badge tone={tx.status === "captured" ? "lime" : tx.status === "failed" ? "danger" : "amber"}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-5">
            <EmptyState
              icon={<Receipt size={18} />}
              title="No transactions yet"
              body="Payments appear here the moment an order is captured for a task."
              action={
                <Link href="/workspace" className="btn btn-primary px-4 py-2 text-[12px]">
                  Delegate a task
                </Link>
              }
            />
          </div>
        )}
      </section>

      <div className="mt-3 rounded-[20px] border border-line bg-[#fbf9f5] px-4 py-3">
        <p className="text-[11px] leading-relaxed text-muted">
          <span className="font-medium text-ink-2">Payment model:</span> HumanFallback collects the
          approved amount as the marketplace operator at the moment work is released, and records the
          provider’s payable balance. The demo does not hold funds in escrow and does not claim to
          disburse automatically — real payouts require a supported PayPal payout arrangement.
        </p>
      </div>
    </div>
  );
}
