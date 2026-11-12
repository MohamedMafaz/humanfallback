## Inspiration

Agents are good at digital work. Ask one to read the electricity meter in your office and it
stops. No hands, no keys, no way into the building. Most assistants hand the task back to you.
We thought the agent should be able to find someone local, brief them, pay them, and check the
result, the same way it calls any other service.

## What it does

You describe the task in plain language. The agent turns it into a brief: what needs doing,
where, the budget, what counts as done, and what evidence it needs back. You can edit any of it
before paying.

Then it ranks people nearby by what they can do, how far away they are, their rating and their
price. Each match comes with a reason built from that person's actual profile, for example
"2 km away, 28 completed meter readings, $10".

You approve the quote and pay through PayPal. The task only reaches the provider after the
payment is captured. They accept it, do the work on site, and upload a photo with a short note.
A vision model compares the photo against the completion criteria and returns a verdict, a
confidence score, anything missing, and any values it could read from the image. You look at it,
then confirm completion or ask for more evidence.

The same four tools are exposed over MCP, so an agent can do all of this without the UI.

## How we built it

Next.js 15, React 19, TypeScript, Tailwind 4.

Matching is plain code: capability, distance, rating, price fit, completed tasks, verification
status. The language model gets that shortlist and writes one sentence about each candidate. It
never sees the raw data, and it can't add experience or availability that isn't there.

Reading the request and writing the rationale runs on deepseek-v4.1-flash through Ollama Cloud.
Photo checks run on gemma4:31b, which can read the meter display. Both are light models; we're
paying for the tokens ourselves.

Payments use PayPal Orders v2. The order is created on the server from the approved quote, the
amount is fixed at that point, and the task is released only after a completed capture. Asking
to capture the same task twice returns the first result instead of charging again.

Evidence is stored, then up to three images go to the vision model with the original criteria.
The structured verdict is saved with the task.

There's an OpenAPI 3.1 file for the whole API at `/api/openapi`. We fed it to APIMatic and the
TypeScript client in `sdk/` is what came out. The admin ledger is AG Grid, with filters, sorting,
pagination and CSV export.

Everything runs from a JSON store that seeds itself on first start, so a judge can clone and run
it without setting up a database.

## Challenges we ran into

The model kept making things up. In our first version it turned a meter reading into a
photography job, and it wrote provider descriptions with details those people never had. We
fixed it by computing every number in code and leaving the model only the job of explaining the
shortlist.

The verifier was almost too good. It refused our placeholder images because they were obviously
graphics, which broke the demo. We kept the strictness, since a verifier that accepts anything is
useless, and swapped the demo evidence for a real photograph of a meter.

PayPal capture needs a real buyer to approve in the hosted checkout. There's no API to fake that
step, so the demo runs on a clearly labelled simulator, and we recorded a separate clip showing
the real order and the actual PayPal page. We didn't want a video claiming a payment that never
happened.

On Vercel each API route is its own function with its own `/tmp`, so multi-step state is
unreliable there. We wrote that in the README instead of shipping a hosted demo that quietly
falls apart. The full loop runs locally with one command.

## Accomplishments that we're proud of

The flow takes under 90 seconds from typing the request to a confirmed task, with real model
calls and real order and capture IDs.

Every match reason on screen comes from stored data, so you can check it against the provider
profile on the next page.

The verifier read a real meter photo correctly: 74,590 kWh, 100% confidence.

One person can use it in the browser while an agent uses it over MCP, and they share the same
task records.

## What we learned

Most of the work was trust, not matching. Ranking seven providers is easy. Making the agent
explain itself, show what was paid, and prove what came back is the hard part. Features that
didn't help with that got cut.

## What's next for HumanFallback - When AI can't do it, we find someone who can

Move the store to Postgres and evidence to object storage, so it can run on more than one server.

Let providers sign up properly, add their own services and set availability.

Add a dispute queue for partial verdicts, and geotagged, timestamped evidence for inspections
where a photo on its own isn't enough.

Pay providers for real, once there's a supported PayPal payout setup. Until then the app records
what's owed and says exactly that on the page.
