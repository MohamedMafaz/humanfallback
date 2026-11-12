import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Camera,
  Check,
  CreditCard,
  ScanEye,
  Sparkles,
  Zap,
} from "lucide-react";
import { Wordmark } from "@/components/brand/Logo";
import { HeroPrompt } from "@/components/landing/HeroPrompt";
import { Avatar, Badge } from "@/components/ui";

const PROVIDERS = [
  {
    name: "Liam Chen",
    tone: "ocean",
    headline: "Meter readings & building inspections",
    rating: 4.8,
    tasks: 28,
    price: 10,
    distance: "2.0 km",
    tag: "Physical inspection",
  },
  {
    name: "Maya Patel",
    tone: "mint",
    headline: "Product photography & retail checks",
    rating: 4.9,
    tasks: 63,
    price: 18,
    distance: "1.6 km",
    tag: "Product verification",
  },
  {
    name: "Priya Raghavan",
    tone: "sunset",
    headline: "Documents, notary runs & city errands",
    rating: 4.9,
    tasks: 37,
    price: 24,
    distance: "1.1 km",
    tag: "Document collection",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Agent understands the request",
    body: "Natural language becomes a structured task: category, location, budget, completion criteria and required evidence.",
    icon: Sparkles,
  },
  {
    n: "02",
    title: "Humans are matched",
    body: "Nearby providers are ranked on capability, distance, rating and price. Every match explains itself with real facts.",
    icon: ScanEye,
  },
  {
    n: "03",
    title: "PayPal moves the money",
    body: "The customer approves a proposal, a PayPal order is created server-side, and capture is verified and idempotent.",
    icon: CreditCard,
  },
  {
    n: "04",
    title: "Evidence is verified",
    body: "The provider uploads a photo. A vision model checks it against the criteria and returns a confidence score.",
    icon: Camera,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-4 py-3 md:px-5 md:py-3.5">
          <span className="hidden sm:block">
            <Wordmark />
          </span>
          <span className="sm:hidden">
            <Wordmark className="[&>svg]:h-8 [&>svg]:w-8 [&>span:last-child]:hidden" />
          </span>
          <nav className="hidden items-center gap-1 md:flex">
            <a href="#how" className="nav-pill">How it works</a>
            <a href="#marketplace" className="nav-pill">Marketplace</a>
            <a href="#agents" className="nav-pill">For agents</a>
            <a href="#payments" className="nav-pill">Payments</a>
          </nav>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link href="/login" className="btn btn-ghost px-3 py-2 text-[12px] sm:px-4 sm:text-[13px]">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary px-3 py-2 text-[12px] sm:px-4 sm:text-[13px]">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 -top-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,138,91,0.35),rgba(255,138,91,0)_65%)] blur-2xl" />
        <div className="pointer-events-none absolute -right-32 top-10 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,242,108,0.45),rgba(201,242,108,0)_65%)] blur-2xl" />

        <div className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-12 md:pb-24 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rise">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1.5 text-[11.5px] text-ink-2 backdrop-blur">
                <span className="flex h-1.5 w-1.5 rounded-full bg-brand" />
                PayPal AI Hackathon 2026
                <span className="text-muted">· Agentic commerce</span>
              </div>

              <h1 className="max-w-[640px] text-[clamp(38px,5.2vw,66px)] font-semibold leading-[0.96] tracking-[-0.045em]">
                When AI can’t do it,
                <br />
                we find{" "}
                <span className="relative inline-block">
                  someone
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    height="10"
                    viewBox="0 0 200 10"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <path d="M2 7.5C50 2.5 150 2.5 198 7.5" stroke="#FF5A1F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  </svg>
                </span>{" "}
                who can.
              </h1>

              <p className="mt-6 max-w-[540px] text-[15.5px] leading-relaxed text-ink-2">
                AI agents can reason, plan and automate. They still can’t walk into a building, read a
                meter or inspect a parcel. HumanFallback is the marketplace where an agent hires a
                verified local human, pays through PayPal, and verifies the evidence that comes back.
              </p>

              <div className="mt-8">
                <HeroPrompt />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck size={14} className="text-forest" /> Verified human providers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CreditCard size={14} className="text-brand" /> PayPal orders & captures
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ScanEye size={14} className="text-plum" /> Vision-checked evidence
                </span>
              </div>
            </div>

            {/* Product mock */}
            <div className="rise rise-2 relative">
              <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-ink p-5 shadow-[0_50px_90px_-50px_rgba(23,19,15,0.65)]">
                <div className="aurora aurora-dim" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-white/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                      Agent run · live
                    </span>
                    <span className="text-[10.5px] text-white/50">HF-1042</span>
                  </div>

                  <div className="mt-5 rounded-[20px] bg-white/95 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <Avatar name="Alex Rivera" tone="sand" size={28} />
                      <div>
                        <p className="text-[11px] font-medium text-muted">Alex</p>
                        <p className="mt-1 text-[13px] leading-snug text-ink">
                          “Go to my office, inspect the electricity meter and send me a photograph of
                          the reading.”
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {[
                      { label: "Human required · physical inspection", done: true },
                      { label: "3 providers shortlisted within 4 km", done: true },
                      { label: "PayPal order created · $10.60", done: true },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-2.5 text-[11.5px] text-white/80">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime text-forest">
                          <Check size={10} strokeWidth={3} />
                        </span>
                        {row.label}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-[20px] border border-white/15 bg-white/10 p-3 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar name="Liam Chen" tone="ocean" size={34} />
                        <div>
                          <p className="text-[12.5px] font-medium text-white">Liam Chen</p>
                          <p className="text-[10.5px] text-white/60">2.0 km · 4.8★ · 28 tasks</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-lime px-2.5 py-1 text-[10.5px] font-semibold text-forest">
                        $10.00
                      </span>
                    </div>
                    <p className="mt-2.5 border-t border-white/10 pt-2.5 text-[11px] leading-relaxed text-white/70">
                      “Liam is walking distance from the office and has completed 28 meter inspections
                      with a 4.8★ rating.”
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-3 hidden items-center gap-2.5 rounded-[18px] border border-line bg-white px-3.5 py-2.5 shadow-[0_20px_40px_-24px_rgba(23,19,15,0.5)] sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-soft text-forest">
                  <ScanEye size={15} />
                </span>
                <div>
                  <p className="text-[11px] text-muted">Evidence verified</p>
                  <p className="tnum text-[13px] font-semibold">94% confidence</p>
                </div>
              </div>

              <div className="absolute -right-2 -top-4 hidden items-center gap-2 rounded-[16px] border border-line bg-white px-3 py-2 shadow-[0_20px_40px_-24px_rgba(23,19,15,0.5)] sm:flex">
                <CreditCard size={14} className="text-brand" />
                <span className="text-[11.5px] font-medium">$10.60 captured</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Stats ---------------- */}
      <section className="mx-auto max-w-[1200px] px-5">
        <div className="grid gap-3 rounded-[28px] border border-line bg-white p-3 sm:grid-cols-3">
          {[
            { k: "4 min", v: "Average time from request to hired human" },
            { k: "100%", v: "Payments verified server-side before work starts" },
            { k: "8", v: "Task categories from meters to warehouse audits" },
          ].map((s) => (
            <div key={s.k} className="rounded-[22px] bg-[#faf8f3] px-5 py-6">
              <p className="tnum text-[30px] font-semibold tracking-[-0.04em]">{s.k}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-muted">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how" className="mx-auto max-w-[1200px] px-5 py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">The workflow</p>
            <h2 className="mt-2 max-w-[560px] text-[clamp(28px,3.4vw,42px)] font-semibold leading-[1.02] tracking-[-0.04em]">
              From intent to verified evidence, in one loop
            </h2>
          </div>
          <p className="max-w-[360px] text-[13.5px] leading-relaxed text-muted">
            Every step is a real API call with a persisted record: task draft, provider shortlist,
            PayPal order, capture, evidence and verdict.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="card group relative overflow-hidden p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-brand-tint text-brand">
                  <step.icon size={17} />
                </span>
                <span className="tnum text-[12px] text-muted">{step.n}</span>
              </div>
              <h3 className="mt-5 text-[15px] font-semibold leading-snug tracking-[-0.02em]">
                {step.title}
              </h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{step.body}</p>
              <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.12),transparent_70%)] opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Marketplace preview ---------------- */}
      <section id="marketplace" className="mx-auto max-w-[1200px] px-5 pb-20">
        <div className="rounded-[34px] bg-ink p-3">
          <div className="rounded-[26px] bg-[#211b16] p-5 md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">
                  The human layer
                </p>
                <h2 className="mt-2 max-w-[520px] text-[clamp(26px,3vw,36px)] font-semibold leading-[1.05] tracking-[-0.04em] text-white">
                  Real people, with the skills the agent lacks
                </h2>
              </div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-[12.5px] text-white/80 transition hover:border-lime hover:text-lime"
              >
                Browse marketplace <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {PROVIDERS.map((p) => (
                <div
                  key={p.name}
                  className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur transition hover:bg-white/[0.1]"
                >
                  <div className="flex items-start justify-between">
                    <Avatar name={p.name} tone={p.tone} size={44} />
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10.5px] text-white/70">
                      {p.distance}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] font-medium text-white">{p.name}</p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-white/55">{p.headline}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-[11px] text-white/60">{p.tag}</span>
                    <span className="tnum text-[12.5px] font-semibold text-lime">${p.price}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[10.5px] text-white/50">
                    <span>{p.rating}★</span>
                    <span>{p.tasks} tasks</span>
                    <span className="inline-flex items-center gap-1">
                      <BadgeCheck size={11} className="text-lime" /> verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Agents / MCP ---------------- */}
      <section id="agents" className="mx-auto max-w-[1200px] px-5 pb-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
              Built for agents
            </p>
            <h2 className="mt-2 max-w-[460px] text-[clamp(26px,3vw,38px)] font-semibold leading-[1.03] tracking-[-0.04em]">
              Not a UI feature. An agent capability.
            </h2>
            <p className="mt-4 max-w-[480px] text-[14px] leading-relaxed text-ink-2">
              HumanFallback exposes the entire delegation loop over an MCP endpoint. Any agent that
              can call a tool can search humans, preview a structured task, and read the evidence
              verdict — no browser required.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="brand">
                <Zap size={11} /> MCP JSON-RPC
              </Badge>
              <Badge tone="lime">preview_task</Badge>
              <Badge tone="ocean">search_humans</Badge>
              <Badge tone="plum">analyze_evidence</Badge>
            </div>
          </div>
          <div className="overflow-hidden rounded-[26px] border border-line bg-[#16120f]">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="ml-3 text-[11px] text-white/40">mcp · tools/call</span>
            </div>
            <pre className="overflow-x-auto scroll-slim p-5 text-[11.5px] leading-relaxed text-white/75">
{`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "preview_task",
    "arguments": {
      "prompt": "Photograph the meter and
                 send me the reading",
      "location": "88 Market St, SF"
    }
  }
}

→ structured task
→ 3 ranked humans + reasons
→ budget, criteria, evidence spec`}
            </pre>
          </div>
        </div>
      </section>

      {/* ---------------- Payments ---------------- */}
      <section id="payments" className="mx-auto max-w-[1200px] px-5 pb-20">
        <div className="relative overflow-hidden rounded-[34px] brand-gradient p-1">
          <div className="rounded-[30px] bg-white p-6 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f0f6ea] px-3 py-1.5 text-[11px] font-medium text-forest">
                  <CreditCard size={13} /> PayPal Orders API v2
                </span>
                <h2 className="mt-4 max-w-[420px] text-[clamp(26px,3vw,36px)] font-semibold leading-[1.05] tracking-[-0.04em]">
                  Money moves with the task, not beside it
                </h2>
                <p className="mt-3 max-w-[440px] text-[13.5px] leading-relaxed text-muted">
                  Payment isn’t a checkout button bolted on the end. The order is created server-side
                  from the approved proposal, capture is verified before a provider is released, and
                  duplicate captures are refused by design.
                </p>
              </div>
              <div className="grid gap-2.5">
                {[
                  { k: "Order created", v: "Server-side, amount locked to the task quote", s: "POST /v2/checkout/orders" },
                  { k: "Capture verified", v: "Only a COMPLETED capture opens the task", s: "POST /v2/checkout/orders/{id}/capture" },
                  { k: "Idempotent by design", v: "A captured task can never be charged twice", s: "payment.status guard" },
                ].map((row) => (
                  <div key={row.k} className="flex items-start gap-3 rounded-[18px] border border-line bg-[#fbf9f5] p-4">
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-forest text-lime">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <div>
                      <p className="text-[13px] font-medium">{row.k}</p>
                      <p className="mt-0.5 text-[12px] text-muted">{row.v}</p>
                      <p className="mt-1 font-mono text-[10.5px] text-muted/80">{row.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="mx-auto max-w-[1200px] px-5 pb-20">
        <div className="relative overflow-hidden rounded-[34px] bg-ink px-6 py-14 text-center md:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,90,31,0.35),transparent_55%)]" />
          <div className="relative">
            <h2 className="mx-auto max-w-[620px] text-[clamp(28px,3.6vw,44px)] font-semibold leading-[1.02] tracking-[-0.04em] text-white">
              Give your agent hands.
            </h2>
            <p className="mx-auto mt-3 max-w-[460px] text-[13.5px] leading-relaxed text-white/60">
              Run the full delegation loop — understanding, matching, payment, evidence — against a
              seeded marketplace. No setup beyond one environment file.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
              <Link href="/signup" className="btn btn-lime px-5 py-3">
                Create an account <ArrowRight size={15} />
              </Link>
              <Link
                href="/login"
                className="btn border border-white/20 bg-white/5 px-5 py-3 text-white hover:bg-white/10"
              >
                Explore the demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-5 py-8 text-[12px] text-muted md:flex-row">
          <div className="flex items-center gap-3">
            <Wordmark />
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-ink">Sign in</Link>
            <a href="/api/mcp" className="hover:text-ink">MCP</a>
            <a href="https://github.com" className="hover:text-ink">GitHub</a>
            <span>PayPal AI Hackathon 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
