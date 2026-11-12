"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Wand2,
  X,
} from "lucide-react";
import type { PublicUser } from "@/types";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/types";
import { Avatar, Badge, Modal } from "@/components/ui";
import { ProviderMatchCard, type MatchView } from "./ProviderMatchCard";
import { cn } from "@/lib/cn";
import { usd } from "@/lib/money";

interface Draft {
  humanRequired: boolean;
  title: string;
  description: string;
  category: Category;
  location: string;
  budget: number;
  priority: "low" | "normal" | "high" | "urgent";
  instructions: string;
  completionCriteria: string[];
  requiredEvidence: string[];
  summary: string;
  confidence: number;
  missing: string[];
  model: string;
  ms: number;
  source: "agent" | "heuristic";
}

type Message = {
  id: string;
  role: "user" | "agent";
  text: string;
  trace?: string[];
  error?: boolean;
};

const FEE_RATE = 0.06;

const SUGGESTIONS = [
  "Photograph the electricity meter at my office and send me the reading. Budget $10.",
  "Check if the MacBook Air M3 is in stock at Best Buy on Harrison St and photo the price tag.",
  "The parcel 1Z999AA10123456784 must be photographed sealed before it leaves the warehouse.",
];

export function WorkspaceClient({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "agent",
      text:
        "I can reason about anything digital, but I have no hands. Describe the physical task and I’ll find a verified human, price it, and prepare the payment.",
    },
  ]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"idle" | "parsing" | "matching" | "ready">("idle");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [matches, setMatches] = useState<MatchView[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [order, setOrder] = useState<{ orderId: string; mode: string; amount: number; approveUrl?: string | null } | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const matchesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("hf.prompt");
      if (stored) {
        sessionStorage.removeItem("hf.prompt");
        setInput(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase]);

  useEffect(() => {
    if (!matches.length) return;
    const el = matchesRef.current;
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [matches.length]);

  function push(message: Omit<Message, "id">) {
    setMessages((m) => [...m, { ...message, id: `m${Date.now()}${Math.random()}` }]);
  }

  async function send(promptOverride?: string) {
    const text = (promptOverride ?? input).trim();
    if (!text || phase === "parsing" || phase === "matching") return;
    setInput("");
    setError(null);
    setDraft(null);
    setMatches([]);
    setSelectedId(null);
    setTaskId(null);
    setPaid(false);
    setDirty(false);
    push({ role: "user", text });
    setPhase("parsing");

    try {
      const res = await fetch("/api/agent/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "The agent could not read that request.");
      const d: Draft = data.draft;
      setDraft(d);
      setAiModel(data.ai?.model ?? d.model);
      setPhase("matching");
      push({
        role: "agent",
        text: `${d.summary} I’ve structured it as a ${CATEGORY_LABELS[d.category].toLowerCase()} task with a $${d.budget} budget. Searching for humans who can do it now.`,
        trace: [
          `Category → ${CATEGORY_LABELS[d.category]}`,
          `Evidence required → ${d.requiredEvidence[0] ?? "photo"}`,
          `Confidence → ${Math.round(d.confidence * 100)}%`,
        ],
      });

      const matchRes = await fetch("/api/agent/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: d.title,
          category: d.category,
          location: d.location,
          budget: d.budget,
          requiredEvidence: d.requiredEvidence,
        }),
      });
      const matchData = await matchRes.json();
      if (!matchRes.ok) throw new Error(matchData.error ?? "Matching failed");
      const found: MatchView[] = matchData.matches ?? [];
      setMatches(found);
      setSelectedId(found[0]?.provider.id ?? null);
      setPhase("ready");
      push({
        role: "agent",
        text: found.length
          ? `I found ${found.length} people nearby. ${found[0].provider.name} is the closest fit — ${found[0].reasons[0]?.label ?? ""}. Review the brief on the right, then approve the payment.`
          : "No available providers matched that task right now. Try widening the location or budget.",
        trace: found.map((m) => `${m.provider.name} · ${m.distanceKm.toFixed(1)} km · $${m.price} · ${m.score}% fit`),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      setError(message);
      setPhase("idle");
      push({ role: "agent", text: message, error: true });
    }
  }

  async function rematch() {
    if (!draft) return;
    setPhase("matching");
    setError(null);
    try {
      const res = await fetch("/api/agent/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          category: draft.category,
          location: draft.location,
          budget: draft.budget,
          requiredEvidence: draft.requiredEvidence,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Matching failed");
      setMatches(data.matches ?? []);
      setSelectedId(data.matches?.[0]?.provider.id ?? null);
      setDirty(false);
      setPhase("ready");
      push({
        role: "agent",
        text: `Re-ranked the marketplace against the updated brief. ${data.matches?.length ?? 0} humans match.`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Matching failed");
      setPhase("ready");
    }
  }

  const selected = matches.find((m) => m.provider.id === selectedId) ?? null;
  const price = selected?.price ?? 0;
  const fee = Math.round(price * FEE_RATE * 100) / 100;
  const total = Math.round((price + fee) * 100) / 100;

  async function hire() {
    if (!draft || !selected || dirty) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, providerId: selected.provider.id, matches }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create the task");
      setTaskId(data.task.id);
      const payRes = await fetch(`/api/tasks/${data.task.id}/pay`, { method: "POST" });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error ?? "Could not create the payment order");
      setOrder({ orderId: payData.orderId, mode: payData.mode, amount: payData.amount, approveUrl: payData.approveUrl });
      setPayOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the hire flow");
    } finally {
      setCreating(false);
    }
  }

  async function pay() {
    if (!taskId) return;
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/capture`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment could not be captured");
      setPaid(true);
      push({
        role: "agent",
        text: `Payment captured. ${selected?.provider.name} has been assigned and can start immediately. I’ll review the evidence when it arrives.`,
      });
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  function edit<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
    setDirty(true);
  }

  const steps = [
    { label: "Understand", done: Boolean(draft), active: phase === "parsing" },
    { label: "Match", done: matches.length > 0, active: phase === "matching" },
    { label: "Hire", done: Boolean(taskId), active: creating || payOpen },
    { label: "Verify", done: false, active: false },
  ];

  const busy = phase === "parsing" || phase === "matching";

  return (
    <div className="grid gap-3 xl:grid-cols-[1.25fr_1fr]">
      {/* ---------------- Chat ---------------- */}
      <section className="card flex h-[calc(100dvh-190px)] min-h-[560px] flex-col overflow-hidden p-0">
        <header className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-[13px] brand-gradient text-white">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold leading-tight">Delegation agent</p>
              <p className="text-[11px] text-muted">
                {aiModel ? `${aiModel} · tool-calling` : "task understanding · matching"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="lime">
              <span className="h-1.5 w-1.5 rounded-full bg-forest" /> online
            </Badge>
          </div>
        </header>

        <div ref={scrollRef} className="scroll-slim flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-5">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
              {m.role === "agent" ? (
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full brand-gradient text-white">
                  <Sparkles size={12} />
                </span>
              ) : (
                <Avatar name={user.name} tone={user.tone} size={28} />
              )}
              <div className={cn("max-w-[86%]", m.role === "user" && "text-right")}>
                <div
                  className={cn(
                    "rounded-[18px] px-3.5 py-2.5 text-[13px] leading-relaxed",
                    m.role === "user"
                      ? "rounded-tr-[6px] bg-ink text-white"
                      : m.error
                        ? "rounded-tl-[6px] bg-danger-soft text-danger"
                        : "rounded-tl-[6px] bg-[#f7f3ec] text-ink",
                  )}
                >
                  {m.text}
                </div>
                {m.trace?.length ? (
                  <div className="mt-2 space-y-1 rounded-[14px] border border-line bg-white px-3 py-2 text-left">
                    {m.trace.map((t, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted">
                        <Check size={11} className="mt-0.5 shrink-0 text-forest" />
                        <span className="font-mono">{t}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {busy ? (
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full brand-gradient text-white">
                <Sparkles size={12} />
              </span>
              <div className="flex items-center gap-1 rounded-[18px] rounded-tl-[6px] bg-[#f7f3ec] px-4 py-3">
                <span className="dot-pulse flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/50" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/50" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/50" />
                </span>
                <span className="ml-2 text-[11.5px] text-muted">
                  {phase === "parsing" ? "reading the request…" : "ranking humans nearby…"}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-line-soft bg-white px-3 py-3 md:px-4">
          {messages.length <= 2 && phase === "idle" ? (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-white px-2.5 py-1.5 text-left text-[11px] text-ink-2 transition hover:border-[#ffcbb4] hover:bg-brand-tint/40"
                >
                  {s.length > 58 ? `${s.slice(0, 58)}…` : s}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-end gap-2 rounded-[18px] border border-line bg-[#fbf9f5] p-1.5 pl-3">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              disabled={busy}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Describe a task that needs a human in the real world…"
              className="max-h-28 min-h-[34px] flex-1 resize-none bg-transparent py-2 text-[13px] outline-none placeholder:text-[#a9a199]"
            />
            <button
              onClick={() => send()}
              disabled={busy || !input.trim()}
              className="btn btn-primary h-9 w-9 shrink-0 p-0"
              aria-label="Send"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
          <p className="mt-2 px-1 text-center text-[10.5px] text-muted">
            The agent can propose and price work — it never pays without your approval.
          </p>
        </div>
      </section>

      {/* ---------------- Run panel ---------------- */}
      <section className="card flex h-[calc(100dvh-190px)] min-h-[560px] flex-col overflow-hidden p-0">
        <header className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
          <div>
            <p className="text-[13.5px] font-semibold leading-tight">Agent run</p>
            <p className="text-[11px] text-muted">
              {phase === "idle"
                ? "waiting for a request"
                : phase === "parsing"
                  ? "understanding"
                  : phase === "matching"
                    ? "matching humans"
                    : "ready for approval"}
            </p>
          </div>
          <Badge tone={phase === "ready" ? "lime" : "neutral"}>
            {phase === "ready" ? "Ready" : "Live"}
          </Badge>
        </header>

        <div className="grid grid-cols-4 gap-1 border-b border-line-soft px-4 py-3">
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition",
                    s.done
                      ? "bg-forest text-lime"
                      : s.active
                        ? "bg-brand text-white"
                        : "bg-[#f1ece5] text-muted",
                  )}
                >
                  {s.done ? <Check size={11} strokeWidth={3} /> : i + 1}
                </span>
                {i < steps.length - 1 ? (
                  <span className={cn("h-px flex-1", s.done ? "bg-forest/30" : "bg-line")} />
                ) : null}
              </div>
              <span
                className={cn(
                  "text-[10.5px]",
                  s.done || s.active ? "font-medium text-ink" : "text-muted",
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div ref={panelRef} className="scroll-slim flex-1 space-y-3 overflow-y-auto p-4">
          {!draft ? (
            <div className="flex h-full flex-col justify-center gap-4 px-2 py-6">
              <div className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-brand-tint text-brand">
                  <Wand2 size={20} />
                </span>
                <p className="mt-3 text-[14px] font-medium">One request, four real steps</p>
                <p className="mx-auto mt-1 max-w-[260px] text-[12px] leading-relaxed text-muted">
                  The agent turns your words into a brief, finds humans, prepares a PayPal order and
                  verifies whatever evidence comes back.
                </p>
              </div>
              <div className="space-y-2">
                {[
                  { icon: Sparkles, label: "Structured task brief", hint: "category, budget, criteria" },
                  { icon: MapPin, label: "Ranked humans nearby", hint: "distance, rating, price" },
                  { icon: CreditCard, label: "PayPal order", hint: "created server-side" },
                  { icon: ShieldCheck, label: "Evidence verdict", hint: "vision-checked with confidence" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 rounded-[16px] border border-line bg-[#fbf9f5] px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-white text-ink-2 shadow-sm">
                      <row.icon size={14} />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium">{row.label}</p>
                      <p className="text-[10.5px] text-muted">{row.hint}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Brief */}
              <div className="rounded-[20px] border border-line p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Task brief
                  </p>
                  {draft.source === "agent" ? (
                    <Badge tone="brand">
                      <Sparkles size={10} /> AI extracted
                    </Badge>
                  ) : (
                    <Badge tone="neutral">rules fallback</Badge>
                  )}
                </div>

                <input
                  value={draft.title}
                  onChange={(e) => edit("title", e.target.value)}
                  className="mt-2 w-full bg-transparent text-[15px] font-semibold tracking-[-0.02em] outline-none"
                />

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[10.5px] text-muted">Category</span>
                    <select
                      value={draft.category}
                      onChange={(e) => edit("category", e.target.value as Category)}
                      className="w-full rounded-[10px] border border-line bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#ffb694]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10.5px] text-muted">Budget (USD)</span>
                    <input
                      type="number"
                      min={5}
                      max={500}
                      value={draft.budget}
                      onChange={(e) => edit("budget", Number(e.target.value))}
                      className="w-full rounded-[10px] border border-line bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#ffb694]"
                    />
                  </label>
                </div>

                <label className="mt-2 block">
                  <span className="mb-1 block text-[10.5px] text-muted">Location</span>
                  <input
                    value={draft.location}
                    onChange={(e) => edit("location", e.target.value)}
                    className="w-full rounded-[10px] border border-line bg-white px-2 py-1.5 text-[12px] outline-none focus:border-[#ffb694]"
                  />
                </label>

                <div className="mt-2.5">
                  <p className="text-[10.5px] text-muted">Completion criteria</p>
                  <ul className="mt-1 space-y-1">
                    {draft.completionCriteria.map((c) => (
                      <li key={c} className="flex items-start gap-1.5 text-[11.5px] text-ink-2">
                        <Check size={10} className="mt-1 shrink-0 text-forest" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {draft.requiredEvidence.map((e) => (
                    <Badge key={e} tone="ocean">
                      {e}
                    </Badge>
                  ))}
                </div>

                {dirty ? (
                  <button
                    onClick={rematch}
                    disabled={phase === "matching"}
                    className="btn btn-ghost mt-3 w-full py-2 text-[12px]"
                  >
                    {phase === "matching" ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RotateCcw size={13} />
                    )}
                    Re-run matching with these edits
                  </button>
                ) : null}
              </div>

              {/* Providers */}
              {matches.length ? (
                <div ref={matchesRef} className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Humans matched · {matches.length}
                    </p>
                    <span className="text-[10.5px] text-muted">ranked by fit</span>
                  </div>
                  {matches.map((m, i) => (
                    <ProviderMatchCard
                      key={m.provider.id}
                      match={m}
                      rank={i + 1}
                      selected={selectedId === m.provider.id}
                      onSelect={() => setSelectedId(m.provider.id)}
                    />
                  ))}
                </div>
              ) : phase === "matching" ? (
                <div className="space-y-2">
                  <div className="skeleton h-[92px] w-full" />
                  <div className="skeleton h-[92px] w-full" />
                </div>
              ) : null}

              {/* Proposal */}
              {selected ? (
                <div className="rounded-[20px] border border-brand/25 bg-brand-tint/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand-700">
                      Proposal
                    </p>
                    <Badge tone="brand">needs your approval</Badge>
                  </div>
                  <div className="mt-2.5 space-y-1.5 text-[12.5px]">
                    <div className="flex justify-between text-ink-2">
                      <span>{selected.provider.name} · service</span>
                      <span className="tnum">{usd(price)}</span>
                    </div>
                    <div className="flex justify-between text-ink-2">
                      <span>Platform fee (6%)</span>
                      <span className="tnum">{usd(fee)}</span>
                    </div>
                    <div className="hairline my-1.5" />
                    <div className="flex justify-between text-[14px] font-semibold">
                      <span>Total today</span>
                      <span className="tnum">{usd(total)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
                    ETA {selected.etaMins} min · {selected.provider.completedTasks} tasks completed ·{" "}
                    {selected.provider.verified ? "identity verified" : "unverified provider"}
                  </p>
                  {dirty ? (
                    <p className="mt-2 text-center text-[10.5px] text-amber">
                      Re-run matching before paying so the price matches your edits.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {error ? (
                <p className="rounded-[14px] bg-danger-soft px-3 py-2 text-[11.5px] text-danger">{error}</p>
              ) : null}
            </>
          )}
        </div>

        {selected && matches.length ? (
          <div className="border-t border-line-soft bg-white p-3">
            <div className="mb-2 flex items-center justify-between px-0.5">
              <span className="truncate text-[11px] text-muted">
                {selected.provider.name} · ETA {selected.etaMins} min
              </span>
              <span className="tnum text-[13px] font-semibold">{usd(total)}</span>
            </div>
            <button
              onClick={hire}
              disabled={creating || dirty || !matches.length}
              className="btn btn-primary w-full py-2.5"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
              Approve & pay with PayPal
            </button>
          </div>
        ) : null}
      </section>

      {/* ---------------- Payment modal ---------------- */}
      <Modal
        open={payOpen}
        onClose={() => {
          if (!paying && !paid) setPayOpen(false);
        }}
        title={paid ? "Payment captured" : "PayPal checkout"}
        subtitle={paid ? `${order ? usd(order.amount) : ""} captured for ${draft?.title}` : "Review and approve the charge"}
        width={460}
      >
        {paid ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 rounded-[18px] bg-lime-soft px-4 py-6 text-center">
              <CheckCircle2 size={34} className="text-forest" />
              <p className="text-[14px] font-semibold text-forest">Payment captured</p>
              <p className="text-[12px] text-forest/70">
                {selected?.provider.name} has been assigned and can start right away.
              </p>
            </div>
            <div className="space-y-1.5 rounded-[14px] border border-line bg-[#fbf9f5] px-3 py-2.5 text-[11.5px]">
              <div className="flex justify-between text-muted">
                <span>Order ID</span>
                <span className="font-mono text-ink">{order?.orderId ?? "—"}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Mode</span>
                <span className="text-ink">{order?.mode === "paypal" ? "PayPal Sandbox" : "Sandbox simulator"}</span>
              </div>
            </div>
            <button
              onClick={() => router.push(`/tasks/${taskId}`)}
              className="btn btn-dark w-full py-2.5"
            >
              Open task <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[18px] border border-line p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar name={selected?.provider.name ?? "Human"} tone={selected?.provider.tone ?? "sand"} size={36} />
                  <div>
                    <p className="text-[12.5px] font-medium">{draft?.title}</p>
                    <p className="text-[10.5px] text-muted">
                      {selected?.provider.name} · ETA {selected?.etaMins} min
                    </p>
                  </div>
                </div>
                <Star size={14} className="text-amber" />
              </div>
              <div className="hairline my-3" />
              <div className="space-y-1.5 text-[12.5px]">
                <div className="flex justify-between text-ink-2">
                  <span>Service</span>
                  <span className="tnum">{usd(price)}</span>
                </div>
                <div className="flex justify-between text-ink-2">
                  <span>Platform fee</span>
                  <span className="tnum">{usd(fee)}</span>
                </div>
                <div className="flex justify-between pt-1 text-[15px] font-semibold">
                  <span>Total</span>
                  <span className="tnum">{usd(total)}</span>
                </div>
              </div>
            </div>

            {order?.mode === "simulated" ? (
              <p className="rounded-[12px] bg-amber-soft px-3 py-2 text-[11px] leading-relaxed text-amber">
                Sandbox simulator. No live money moves until <span className="font-mono">PAYPAL_CLIENT_ID</span> and{" "}
                <span className="font-mono">PAYPAL_CLIENT_SECRET</span> are configured.
              </p>
            ) : (
              <p className="rounded-[12px] bg-lime-soft px-3 py-2 text-[11px] text-forest">
                Live PayPal Sandbox order {order?.orderId}.
              </p>
            )}

            {payError ? (
              <p className="rounded-[12px] bg-danger-soft px-3 py-2 text-[11.5px] text-danger">{payError}</p>
            ) : null}

            {order?.mode === "paypal" ? (
              <button
                onClick={() => {
                  const url =
                    order.approveUrl ??
                    `https://www.sandbox.paypal.com/checkoutnow?token=${order.orderId}`;
                  window.location.href = url;
                }}
                className="btn btn-primary w-full py-3"
              >
                <CreditCard size={15} /> Continue to PayPal Sandbox
              </button>
            ) : (
              <button onClick={pay} disabled={paying} className="btn btn-primary w-full py-3">
                {paying ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                {paying ? "Capturing payment…" : `Pay ${usd(total)}`}
              </button>
            )}
            <p className="text-center text-[10.5px] text-muted">
              The task is released to the provider only after the capture is verified.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
