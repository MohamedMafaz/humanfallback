# 3-minute demo script

Target 2:45. Record at 1440p, browser at 100% zoom, two accounts in two windows
(Alex on the left, Priya on the right) so the hand-off needs no sign-out.

| Time | Shot | Say |
|---|---|---|
| 0:00–0:12 | Landing page, cursor over the headline | “AI agents can plan, research and automate almost anything — until the work needs hands. This is HumanFallback: the human workforce for AI agents.” |
| 0:12–0:25 | Scroll to the four workflow cards | “One request runs through four real steps: understand, match, pay with PayPal, verify the evidence.” |
| 0:25–0:40 | Click **Get started** → sign in as **Alex Rivera** | “I’m Alex. My operations agent handles the digital work. It can’t walk into my building.” |
| 0:40–0:55 | Agent workspace, paste the prompt | Prompt: *“Go to my office, inspect the electricity meter and send me a photograph of the reading. Budget $10.”* |
| 0:55–1:10 | Watch the trace + brief appear | “The agent turned that into a structured task — category, completion criteria, required evidence — and it’s editable. Nothing is charged yet.” |
| 1:10–1:25 | Hover the three provider cards | “It ranked three humans nearby on capability, distance, rating and price. Every reason is a stored fact, not a model hallucination: 2.0 km, 28 tasks, $10.” |
| 1:25–1:40 | Select Liam (or keep the top match) → **Approve & pay** | “I approve the proposal. The order is created server-side, fixed to the quote: ten dollars service, sixty cents platform fee.” |
| 1:40–1:50 | Payment modal → **Pay** → captured | “Capture verified. Only now is the task released. Capturing twice is refused by design.” |
| 1:50–2:05 | Switch to Priya → **Provider desk** → open task → **Accept** → **Start** | “Priya sees it on her desk with the exact evidence requirements. She accepts and heads to the utility room.” |
| 2:05–2:25 | Upload a real photo + note → **Submit for AI verification** | “She uploads the photo. The vision model compares it against the task’s completion criteria and returns a verdict with a confidence score.” |
| 2:25–2:35 | Task page, verification card | “Ninety-something percent, with the extracted reading. The verdict is advisory — the agent never completes or refunds on its own.” |
| 2:35–2:45 | Alex → **Approve completion** → Transactions | “I confirm. The transaction records the PayPal order and capture IDs. Delegation complete.” |
| 2:45–2:55 | Cut to `/api/mcp` response or admin dashboard | “The same loop is exposed over MCP, so any agent — not just this UI — can hire a human. PayPal Orders v2, a light multimodal model, and one honest ledger of what happened.” |

## Pre-flight checklist

- [ ] `npm run build && npm start` (not dev) for a clean recording.
- [ ] Demo data reset (admin → **Reset demo data**).
- [ ] A real photo of a meter/object ready on the provider side — the verifier rejects synthetic images.
- [ ] PayPal keys in `.env.local`, or the simulator banner is acceptable and visible.
- [ ] Close devtools, hide the bookmarks bar, 1440×900 window.
- [ ] Record the browser tab only; no third-party music.

## Backup beats

- If the model is slow: the brief appears within ~6 s; keep talking over the trace.
- If matching returns fewer providers: edit the location to “San Francisco, CA” and re-run.
- If a capture fails: the task stays `awaiting_payment`; click **Pay with PayPal** again on the task page.
