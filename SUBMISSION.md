# Devpost submission copy

## Inspiration

Every agent demo ends the same way: the agent does brilliant digital work, then hits a door it
cannot open — a meter to read, a parcel to photograph, a lease to collect — and hands the task
back to the human. We wanted to remove that dead end. If an agent can call an API, it should be
able to call a person.

## What it does

HumanFallback is a marketplace of verified humans that an AI agent can hire like any other tool.

A natural-language request becomes a structured task (category, budget, completion criteria,
required evidence). The agent ranks nearby humans using stored facts — capability, distance,
rating, price, volume — and explains each match. The customer approves a proposal; a PayPal
order is created server-side and captured with verification before the task is released. The
provider completes the work and uploads evidence; a multimodal model checks that evidence
against the criteria and returns a verdict with a confidence score. The customer makes the final
call. Every order, capture and verdict is recorded.

## How we built it

- **Next.js 15 + React 19 + TypeScript + Tailwind 4**, built around the delegation loop.
- **Task understanding** — a light flash model (Ollama Cloud, OpenAI-compatible) converts the
  request into strict JSON, with a deterministic fallback and a category sanity check.
- **Matching** — arithmetic in `lib/matching.ts`; the model only writes the explanation, and is
  forbidden from inventing provider attributes.
- **PayPal** — Orders v2 create → capture, server-side only, with idempotent capture guards,
  status tracking and a transaction ledger.
- **Evidence verification** — a multimodal model receives up to three images plus the original
  criteria and returns `verdict / confidence / summary / missing / extracted`.
- **MCP** — the same four tools over JSON-RPC, so external agents can delegate without the UI.
- **AG Grid** — the operations ledger is a real AG Grid with quick filter, column filters,
  sorting, pagination, CSV export and React cell renderers, themed with the Quartz Theming API.
- **APIMatic** — the entire REST surface is an OpenAPI 3.1 contract (`openapi/humanfallback.yaml`,
  served at `/api/openapi`), wired to the APIMatic CLI for spec validation, SDK generation and a
  documentation portal.
- **Storage** — a seeded JSON document store with atomic writes, so judges can run it with no
  database setup.

## Challenges

- Keeping the model honest. The first version let it choose the category freely and “photograph
  the meter” became *photography*. We added explicit work-vs-medium rules and a deterministic
  category refinement.
- Making verification strict without being useless. The vision model correctly rejects synthetic
  or unrelated images; we kept that strictness and made the UI treat the verdict as advisory.
- Making payments feel real without pretending. The simulator produces identical records but is
  labelled everywhere, and the UI never claims escrow or automatic payouts.

## Accomplishments

- A complete loop a judge can run in under a minute, with real model calls and real order/capture
  records.
- Every match reason is a stored fact — no hallucinated providers.
- A design system that works from 375 px to 1440 px, with no external image dependencies.

## What we learned

Delegation is a trust problem, not a matching problem. The product only works if the agent can
prove why it chose someone, prove what was paid, and prove what came back.

## What's next

- Postgres + object storage for multi-instance deployment.
- Provider onboarding with identity verification and service listings.
- Dispute resolution workflow and manual review queue.
- Real PayPal payouts once a supported disbursement arrangement is in place.
- Signed evidence (geotag + timestamp) and multi-image verification.

## Built with

next.js, react, typescript, tailwindcss, ollama, minimax-m3.1-flash, gemma4:31b, paypal-orders-api,
mcp, json-rpc, ag-grid, apimatic, openapi, zod, lucide, docker, render

## Try it

- Repo: https://github.com/MohamedMafaz/humanfallback
- Preview: https://humanfallback.vercel.app
- Run locally (full loop): `npm install && npm run dev`
- Sign in: `alex@humanfallback.ai` / `demo1234` (customer), `liam@humanfallback.ai` or
  `priya@humanfallback.ai` / `demo1234` (providers), `admin@humanfallback.ai` / `demo1234`
