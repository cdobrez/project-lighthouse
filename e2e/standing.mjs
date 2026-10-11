import { chromium } from "playwright-core";
const launch = { args: ["--no-sandbox"] };
if (process.env.CHROME_PATH) launch.executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(launch);
const p = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const B = process.env.BASE ?? "http://localhost:3000";
const SECRET = process.env.CRON_SECRET ?? "testsecret";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = DAYS[(new Date().getUTCDay() + 6) % 7];
async function login(email) { await p.goto(`${B}/login`); await p.fill("#email", email); await p.fill("#password", "neighbor123"); await p.click("button[type=submit]"); await p.waitForURL("**/meals"); }
await login("demo@gigkitchens.com");
// Pick a meal that is cooked today so the cron has something to place.
await p.goto(`${B}/meals?day=${today}`);
const href = await p.locator("article h3 a").first().getAttribute("href");
await p.goto(`${B}${href}`);
const mealTitle = (await p.locator("h1").first().textContent()).trim();
console.log("using", mealTitle);
await p.locator("aside button", { hasText: "Make it weekly" }).click();
const dayOptions = await p.locator("select[name=day] option").allTextContents();
const day = dayOptions.includes(today) ? today : dayOptions[0];
await p.selectOption("select[name=day]", day);
await p.selectOption("select[name=fulfillment]", "dropoff");
await p.fill("input[name=address]", "412 Elm St, Maple Grove");
await p.click("button:has-text('Start weekly order')");
await p.waitForSelector("text=Weekly order set");
console.log("standing order created for", day, day === today ? "(today)" : "(not today)");
await p.goto(`${B}/account`);
await p.waitForSelector("text=every " + day);
console.log("visible in account");
const r = await p.request.get(`${B}/api/cron/standing-orders`, { headers: { authorization: `Bearer ${SECRET}` } });
const body = await r.json();
console.log("cron:", r.status(), JSON.stringify(body));
const unauth = await p.request.get(`${B}/api/cron/standing-orders`);
console.log("cron without secret:", unauth.status());
if (day === today) {
  if (!body.created.length) throw new Error("cron created nothing for today");
  await p.goto(`${B}/orders`);
  await p.waitForSelector(`text=${mealTitle}`);
  console.log("order placed by cron is visible");
  const r2 = await p.request.get(`${B}/api/cron/standing-orders`, { headers: { authorization: `Bearer ${SECRET}` } });
  console.log("second run skips:", JSON.stringify((await r2.json()).skipped));
}
await p.goto(`${B}/account`);
await p.click("button:has-text('Pause')");
await p.waitForSelector("button:has-text('Resume')");
console.log("paused ok");
console.log("STANDING OK");
await browser.close();
