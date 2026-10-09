import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
const SHOT = process.env.SHOT ?? "e2e/screenshots";
import { mkdirSync } from "node:fs";
mkdirSync(SHOT, { recursive: true });
// Runs the whole neighbor + cook journey against a running server.
//   BASE=http://localhost:3000 CHROME_PATH=/path/to/chrome node e2e/flow.mjs
// CHROME_PATH may be omitted when `npx playwright install chromium` has been run.
const launch = { args: ["--no-sandbox"] };
if (process.env.CHROME_PATH) launch.executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(launch);
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
const log = (...a) => console.log("•", ...a);
const stamp = Date.now();

try {
  // 1. Sign up a new neighbor
  await page.goto(`${BASE}/signup`);
  await page.fill("#name", "Test Neighbor");
  await page.fill("#email", `test${stamp}@example.com`);
  await page.fill("#password", "neighbor123");
  await page.click("button[type=submit]");
  await page.waitForURL("**/meals", { timeout: 20000 });
  log("signed up ->", page.url());

  // 2. Add two of a meal from the detail page
  await page.goto(`${BASE}/meals/nonnas-baked-lasagna`);
  await page.click('button[aria-label="Increase quantity"]');
  await page.click("text=Add 2 to basket");
  await page.waitForSelector("text=Added");
  log("added lasagna x2");

  // 3. Try adding from a different cook -> should be refused
  await page.goto(`${BASE}/meals/beef-pho-kit`);
  await page.click("text=Add to basket");
  await page.waitForSelector("text=One cook per order");
  log("cross-cook add refused as designed");

  // 4. Add another Rosa meal from the card on the cook page
  await page.goto(`${BASE}/cooks/rosas-kitchen`);
  await page.locator("article", { hasText: "Minestrone" }).locator("button", { hasText: "+ Add" }).click();
  await page.waitForTimeout(300);
  await page.goto(`${BASE}/cart`);
  const basketLines = await page.locator("a:has-text('Nonna')").count();
  log("basket shows lasagna lines:", basketLines);
  await page.screenshot({ path: `${SHOT}/cart.png`, fullPage: true });

  // 5. Checkout with drop-off
  await page.click("text=Continue to checkout");
  await page.waitForURL("**/checkout");
  await page.click("label:has-text('Porch drop-off')");
  await page.fill("#address", "412 Elm St, Maple Grove");
  await page.fill("#note", "Side gate is open, thank you!");
  await page.click("button:has-text('15%')");
  await page.screenshot({ path: `${SHOT}/checkout.png`, fullPage: true });
  await page.click("button:has-text('Place order')");
  await page.waitForURL("**/orders/*", { timeout: 20000 });
  const orderUrl = page.url();
  log("order placed ->", orderUrl);
  await page.waitForSelector("text=Order placed");
  await page.screenshot({ path: `${SHOT}/order.png`, fullPage: true });

  // 6. Rate attempt should not be shown yet (not delivered)
  const rateVisible = await page.locator("text=How was it?").count();
  log("rating form before delivery:", rateVisible === 0 ? "hidden (correct)" : "VISIBLE (bug)");

  // 7. Sign out, sign in as Rosa, advance the order
  await page.goto(`${BASE}/account`);
  await page.click("button:has-text('Sign out')");
  await page.waitForURL(`${BASE}/`);
  await page.goto(`${BASE}/login`);
  await page.fill("#email", "rosa@example.com");
  await page.fill("#password", "neighbor123");
  await page.click("button[type=submit]");
  await page.waitForURL("**/meals");
  await page.goto(`${BASE}/cook`);
  await page.waitForSelector("text=Needs your attention");
  await page.screenshot({ path: `${SHOT}/cook-dashboard.png`, fullPage: true });
  for (const label of ["Cook accepted", "Cooking now", "On its way", "Delivered"]) {
    const btn = page.locator(`button:has-text("Mark: ${label}")`).first();
    await btn.click();
    await page.waitForTimeout(700);
    log("advanced ->", label);
  }
  await page.waitForSelector("text=Completed");

  // 8. Cook edits a meal + creates a new one
  await page.goto(`${BASE}/cook/meals/new`);
  await page.fill("#title", `Test Tiramisu ${stamp}`);
  await page.fill("#price", "9");
  await page.fill("#description", "Espresso-soaked ladyfingers and mascarpone, made the night before so it sets properly.");
  await page.fill("#cuisine", "Dessert");
  await page.click("label:has-text('Fri')");
  await page.click("label:has-text('Sat')");
  await page.click("button:has-text('List this meal')");
  await page.waitForURL("**/cook/meals");
  await page.waitForSelector(`text=Test Tiramisu ${stamp}`);
  log("new meal listed");

  // 9. Back as customer: order is delivered, rate it
  await page.goto(`${BASE}/account`);
  await page.click("button:has-text('Sign out')");
  await page.waitForURL(`${BASE}/`);
  await page.goto(`${BASE}/login`);
  await page.fill("#email", `test${stamp}@example.com`);
  await page.fill("#password", "neighbor123");
  await page.click("button[type=submit]");
  await page.waitForURL("**/meals");
  await page.goto(orderUrl.split("?")[0]);
  await page.waitForSelector("text=How was it?");
  const form = page.locator("form").filter({ hasText: "Rate this recipe" }).first();
  await form.locator('button[aria-label="5 stars"]').click();
  await form.locator("textarea").fill("Kids asked for seconds. The porch drop-off was right on time.");
  await form.locator("button:has-text('Post rating')").click();
  await page.waitForSelector("text=Thanks for rating");
  log("rating posted");
  await page.screenshot({ path: `${SHOT}/order-delivered.png`, fullPage: true });

  // 10. Community: post and reply
  await page.goto(`${BASE}/community`);
  await page.click("label:has-text('Looking for')");
  await page.fill("input[name=title]", "Anyone make pierogi?");
  await page.fill("textarea[name=body]", "My grandmother's were the best. Would love to find someone nearby.");
  await page.click("button:has-text('Post')");
  await page.waitForSelector("text=Posted to the");
  await page.click("text=Anyone make pierogi?");
  await page.waitForURL("**/community/*");
  await page.fill("input[name=body]", "Hannah in Oak Hollow does a potato-cheddar one on request!");
  await page.click("button:has-text('Reply')");
  await page.waitForSelector("text=Hannah in Oak Hollow");
  log("community post + reply ok");
  await page.screenshot({ path: `${SHOT}/community.png`, fullPage: true });

  // 11. Become a cook as the test user
  await page.goto(`${BASE}/become-a-cook`);
  await page.fill("#displayName", "Test Kitchen");
  await page.fill("#tagline", "Weeknight soups and big salads");
  await page.fill("#bio", "I cook a big pot of soup every Sunday and never finish it. Now the block can help.");
  await page.click("button:has-text('Open my kitchen')");
  await page.waitForURL("**/cook?welcome=1");
  await page.waitForSelector("text=Your kitchen is open");
  log("became a cook");

  // 12. Mobile layout screenshot
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mp = await mobile.newPage();
  await mp.goto(`${BASE}/`);
  await mp.screenshot({ path: `${SHOT}/mobile-home.png`, fullPage: true });
  await mp.goto(`${BASE}/meals`);
  await mp.screenshot({ path: `${SHOT}/mobile-meals.png`, fullPage: true });
  await mobile.close();

  console.log("\nFLOW OK");
} catch (e) {
  console.error("\nFLOW FAILED:", e.message);
  await page.screenshot({ path: `${SHOT}/failure.png`, fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  if (errors.length) console.log("\nBrowser errors:\n" + errors.slice(0, 10).join("\n"));
  await browser.close();
}
