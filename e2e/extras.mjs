import { chromium } from "playwright-core";
const launch = { args: ["--no-sandbox"] };
if (process.env.CHROME_PATH) launch.executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(launch);
const p = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const B = process.env.BASE ?? "http://localhost:3000";
async function login(email) { await p.goto(`${B}/login`); await p.fill("#email", email); await p.fill("#password", "neighbor123"); await p.click("button[type=submit]"); await p.waitForURL("**/meals"); }
async function logout() { await p.goto(`${B}/account`); await p.click("button:has-text('Sign out')"); await p.waitForURL(`${B}/`); }
// reorder from a past order
await login("demo@gigkitchens.com");
await p.goto(`${B}/orders`);
await p.locator("a[href^='/orders/ord_']").filter({ hasText: /Delivered|Picked up/ }).first().click();
await p.waitForURL("**/orders/ord_*");
await p.screenshot({ path: "e2e/screenshots/order-past.png", fullPage: true });
await p.click("button:has-text('Order this again')");
await p.waitForURL("**/cart");
await p.waitForSelector("text=Continue to checkout");
console.log("reorder -> basket ok");
// portions reset: buy portions, then run cron and verify count restored
await p.goto(`${B}/cart`);
await p.click("text=Clear basket");
await p.goto(`${B}/meals/apple-crumble-pie`);
const before = await p.locator("dd").nth(2).textContent();
await p.click("text=Add to basket");
await p.goto(`${B}/checkout`);
await p.click("button:has-text('Place order')");
await p.waitForURL("**/orders/*");
await p.goto(`${B}/meals/apple-crumble-pie`);
const after = await p.locator("dd").nth(2).textContent();
const r = await p.request.get(`${B}/api/cron/standing-orders`, { headers: { authorization: "Bearer testsecret" } });
const body = await r.json();
await p.goto(`${B}/meals/apple-crumble-pie`);
const reset = await p.locator("dd").nth(2).textContent();
console.log("portions before/after/reset:", before, after, reset, "cron:", JSON.stringify(body));
await logout();
// earnings page
await login("rosa@example.com");
await p.goto(`${B}/cook/earnings`);
await p.waitForSelector("text=Best sellers");
await p.screenshot({ path: "e2e/screenshots/earnings.png", fullPage: true });
console.log("earnings page ok");
await p.goto(`${B}/meals/nonnas-baked-lasagna`);
await p.click("button:has-text('Make it weekly')");
await p.screenshot({ path: "e2e/screenshots/meal-weekly.png", fullPage: true });
console.log("EXTRAS OK");
await browser.close();
