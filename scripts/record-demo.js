const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3100";
const OUT = path.join(__dirname, "recording");
const SHOTS = path.join(__dirname, "stills");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });

const CURSOR = () => {
  const mk = () => {
    if (document.getElementById("hf-cursor")) return;
    const c = document.createElement("div");
    c.id = "hf-cursor";
    c.style.cssText =
      "position:fixed;width:18px;height:18px;border-radius:50%;background:rgba(255,90,31,.35);border:2px solid #ff5a1f;box-shadow:0 4px 12px rgba(0,0,0,.2);pointer-events:none;z-index:2147483647;left:-40px;top:-40px;transition:transform .08s ease-out";
    document.documentElement.appendChild(c);
    document.addEventListener("mousemove", (e) => {
      c.style.left = e.clientX - 9 + "px";
      c.style.top = e.clientY - 9 + "px";
    });
    document.addEventListener("mousedown", () => (c.style.transform = "scale(.7)"));
    document.addEventListener("mouseup", () => (c.style.transform = "scale(1)"));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mk);
  else mk();
};

const CAPTION = () => {
  const mk = () => {
    if (document.getElementById("hf-cap")) return;
    const d = document.createElement("div");
    d.id = "hf-cap";
    d.style.cssText =
      "position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:2147483646;" +
      "background:rgba(23,19,15,.88);color:#fff;padding:11px 20px;border-radius:999px;" +
      "font:500 15px/1.25 Inter,Segoe UI,system-ui;letter-spacing:-0.01em;" +
      "box-shadow:0 10px 34px rgba(0,0,0,.28);max-width:78vw;text-align:center;" +
      "opacity:0;transition:opacity .35s";
    d.textContent = "";
    document.documentElement.appendChild(d);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mk);
  else mk();
};

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  });
  await ctx.addInitScript(CURSOR);
  await ctx.addInitScript(CAPTION);

  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message));

  async function cap(text) {
    await page.evaluate((t) => {
      const d = document.getElementById("hf-cap");
      if (!d) return;
      d.textContent = t;
      d.style.opacity = t ? "1" : "0";
    }, text);
  }
  const wait = (ms) => page.waitForTimeout(ms);

  async function goto(url) {
    await page.goto(url, { waitUntil: "networkidle" });
    await wait(400);
  }

  // 1 — Landing
  await goto(`${BASE}/`);
  await cap("HumanFallback — the human workforce for AI agents");
  await wait(2600);
  await page.mouse.move(700, 420, { steps: 12 });
  await wait(1400);

  // 2 — Sign in as the buyer
  await page.getByRole("link", { name: "Get started" }).click();
  await page.waitForURL("**/signup");
  await wait(700);
  await cap("Sign in as Alex, an agent owner");
  await goto(`${BASE}/login`);
  await page.getByRole("button", { name: /Alex Rivera/ }).click();
  await page.waitForURL("**/dashboard", { timeout: 30000 });
  await wait(1800);

  // 3 — Workspace
  await page.getByRole("link", { name: "Agent workspace" }).click();
  await page.waitForURL("**/workspace");
  await wait(900);
  await cap("Describe work the agent cannot physically do");
  await wait(1200);

  const prompt =
    "Go to my office at 88 Market St, inspect the electricity meter and send me a photograph of the reading. Budget $10.";
  await page.fill("textarea", prompt);
  await wait(900);
  await page.keyboard.press("Enter");

  await cap("The agent is structuring the request…");
  await page.waitForSelector("text=Best fit", { timeout: 120000 });
  await wait(1200);
  await cap("Three humans nearby, ranked on facts — distance, rating, price");
  await wait(4200);

  // 4 — Pay
  await page.getByRole("button", { name: /Approve & pay with PayPal/ }).click();
  await wait(1200);
  await cap("A PayPal order is created server-side for the approved quote");
  await wait(2400);
  await page.getByRole("button", { name: /^Pay \$/ }).click();
  await page.waitForSelector("text=Payment captured", { timeout: 30000 });
  await wait(1400);
  await cap("Capture verified — only now is the task released");
  await wait(1600);
  await page.getByRole("button", { name: /Open task/ }).click();
  await page.waitForURL("**/tasks/**");
  const taskUrl = page.url();
  await wait(1500);

  // 5 — Provider side
  await cap("The provider sees the exact evidence requirements");
  await page.getByRole("button", { name: /Alex/ }).click();
  await wait(500);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(`${BASE}/`);
  await wait(900);

  await goto(`${BASE}/login`);
  await page.fill('input[type="email"]', "liam@humanfallback.ai");
  await page.fill('input[type="password"]', "demo1234");
  await wait(600);
  await page.getByRole("button", { name: /^Sign in/ }).click();
  await page.waitForURL("**/provider", { timeout: 30000 });
  await wait(1600);
  await cap("The matched provider sees the agent's task on his desk");
  await page.locator('a[href^="/tasks/"]').first().click();
  await page.waitForURL("**/tasks/**");
  await wait(1200);

  await page.getByRole("button", { name: "Accept this task" }).click();
  await wait(1400);
  await page.getByRole("button", { name: "Start work on site" }).click();
  await wait(1400);
  await cap("He uploads a photo and reports the reading");
  await page.setInputFiles('input[type="file"]', path.join(__dirname, "..", "humanfallback", "public", "demo", "meter-reading.jpg"));
  await wait(600);
  await page.fill('input[placeholder^="Short note"]', "Ground floor utility room. Register 1 reads 74590 kWh.");
  await wait(700);
  await page.getByRole("button", { name: /Submit for AI verification/ }).click();
  await cap("The vision model checks the photo against the task criteria…");
  await page.waitForSelector("text=/Evidence verified|Partially verified —/", { timeout: 150000 });
  await wait(2600);
  await cap("Verdict: verified, with the reading extracted from the image");
  await wait(3400);

  // 6 — Buyer confirms
  await page.getByRole("button", { name: /Liam/ }).click();
  await wait(500);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(`${BASE}/`);
  await wait(800);
  await goto(`${BASE}/login`);
  await page.getByRole("button", { name: /Alex Rivera/ }).click();
  await page.waitForURL("**/dashboard", { timeout: 30000 });
  await wait(900);
  await goto(taskUrl);
  await cap("The customer reviews the evidence and confirms completion");
  await wait(1800);
  await page.getByRole("button", { name: /Approve completion/ }).click();
  await wait(1800);
  await cap("Completed — with the PayPal order and capture on record");
  await wait(1400);

  await goto(`${BASE}/transactions`);
  await cap("Every order and capture, reconciled");
  await wait(2200);

  // 7 - Operations ledger (AG Grid)
  await page.getByRole("button", { name: /Alex/ }).click();
  await wait(500);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(`${BASE}/`);
  await wait(600);
  await goto(`${BASE}/login`);
  await page.getByRole("button", { name: /Platform Admin/ }).click();
  await page.waitForURL("**/admin", { timeout: 30000 });
  await wait(1200);
  await cap("Operations: every delegation in an AG Grid — filter, sort, export");
  await wait(4200);
  await page.mouse.move(900, 600, { steps: 10 });
  await wait(1200);

  await cap("");
  await wait(600);

  const video = page.video();
  const saved = path.join(OUT, "humanfallback-demo.webm");
  await page.close();
  await video.saveAs(saved);
  await ctx.close();
  await browser.close();
  console.log("VIDEO:", saved, fs.statSync(saved).size);
})();
