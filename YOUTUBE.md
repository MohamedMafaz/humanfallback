# Uploading the demo video

The finished file is **`../demo/humanfallback-demo.mp4`** (1:47, 1440×900, no audio, captioned
on screen). It is under the 3-minute limit and shows the loop end to end, plus a proof clip of a
real PayPal Sandbox checkout.

## YouTube upload (2 minutes)

1. youtube.com → **Create → Upload video** → select `demo/humanfallback-demo.mp4`.
2. Title:

   ```
   HumanFallback — when AI can't, a human can | PayPal AI Hackathon 2026
   ```

3. Description (paste as is):

   ```
   AI agents can plan, research and automate digital work — but they can't read a meter,
   photograph a parcel or collect a signed lease. HumanFallback lets an agent hire a verified
   human, pay through PayPal, and verify the evidence that comes back.

   0:00  The problem
   0:12  Sign in as an agent owner
   0:20  The agent structures a real-world task
   0:28  Three humans ranked on facts, not vibes
   0:33  PayPal order created and captured
   0:40  The human accepts and submits photo evidence
   0:50  Vision model verifies the evidence (100% confidence)
   1:00  Customer confirms; transaction recorded
   1:12  Operations ledger (AG Grid)
   1:27  Proof: the same flow against live PayPal Sandbox

   Built with Next.js, PayPal Orders v2, Ollama Cloud (deepseek-v4.1-flash + gemma4:31b),
   AG Grid and APIMatic. Code: https://github.com/MohamedMafaz/humanfallback
   ```

4. Visibility: **Public**. Not made for kids. No music (none is used).
5. Copy the YouTube URL into the Devpost submission form.

## Re-recording (optional)

`_video/record.js` drives the whole flow with Playwright and burns in captions. Run the app with
`PAYPAL_MODE=simulated` for a capture that completes without a buyer session, then
`node record.js` from `_video/`.
