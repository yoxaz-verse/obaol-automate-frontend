import { writeFileSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const baseUrl = process.env.LH_BASE_URL || process.env.E2E_BASE_URL || "http://127.0.0.1:3100";
const outputDir = process.env.LH_OUTPUT_DIR || "reports/lighthouse";
const routes = (process.env.LH_ROUTES || "/auth").split(",").map((route) => route.trim()).filter(Boolean);
const thresholds = {
  performance: Number(process.env.LH_PERFORMANCE_MIN || 0.55),
  accessibility: Number(process.env.LH_ACCESSIBILITY_MIN || 0.85),
  bestPractices: Number(process.env.LH_BEST_PRACTICES_MIN || 0.75),
  seo: Number(process.env.LH_SEO_MIN || 0.75),
};
const enforceSeoOnAppRoutes = process.env.LH_REQUIRE_APP_ROUTE_SEO === "1";

const asUrl = (route) => {
  const url = new URL(route, baseUrl);
  return url.toString();
};

const formatScore = (score) => Math.round(Number(score || 0) * 100);

const waitForServer = async (url, timeoutMs = 120_000) => {
  const startedAt = Date.now();
  const healthUrl = new URL(routes[0] || "/", url).toString();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(healthUrl, { method: "HEAD" });
      if (response.status >= 200 && response.status < 400) return true;
    } catch {
      // Keep polling until the server is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
};

const ensureServer = async () => {
  if (await waitForServer(baseUrl, 1_000)) return null;

  if (process.env.LH_SKIP_WEB_SERVER === "1") {
    throw new Error(`No server is reachable at ${baseUrl}. Start the app or unset LH_SKIP_WEB_SERVER.`);
  }

  const child = spawn("npm", ["run", "start"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: new URL(baseUrl).port || process.env.PORT || "3000" },
  });

  child.stdout.on("data", (chunk) => process.stdout.write(`[Next] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[Next] ${chunk}`));

  if (!(await waitForServer(baseUrl))) {
    child.kill("SIGTERM");
    throw new Error(`Timed out waiting for ${baseUrl}`);
  }

  return child;
};

mkdirSync(outputDir, { recursive: true });

const nextServer = await ensureServer();
const chrome = await chromeLauncher.launch({
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

try {
  const failures = [];

  for (const route of routes) {
    const url = asUrl(route);
    const result = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      formFactor: "mobile",
      screenEmulation: {
        mobile: true,
        width: 390,
        height: 844,
        deviceScaleFactor: 3,
        disabled: false,
      },
      throttlingMethod: "simulate",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    });

    if (!result?.lhr) {
      throw new Error(`Lighthouse did not return a report for ${url}`);
    }

    const lhr = result.lhr;
    const filename = `${outputDir}/${route.replace(/^\//, "").replace(/[^\w.-]+/g, "-") || "root"}.json`;
    writeFileSync(filename, JSON.stringify(lhr, null, 2));

    const categories = lhr.categories;
    const metrics = {
      lcp: lhr.audits["largest-contentful-paint"]?.numericValue,
      cls: lhr.audits["cumulative-layout-shift"]?.numericValue,
      tbt: lhr.audits["total-blocking-time"]?.numericValue,
      speedIndex: lhr.audits["speed-index"]?.numericValue,
      interactive: lhr.audits.interactive?.numericValue,
    };

    console.log(`${route}`);
    console.log(`  Performance: ${formatScore(categories.performance?.score)}`);
    console.log(`  Accessibility: ${formatScore(categories.accessibility?.score)}`);
    console.log(`  Best practices: ${formatScore(categories["best-practices"]?.score)}`);
    console.log(`  SEO: ${formatScore(categories.seo?.score)}`);
    console.log(`  LCP/CLS/TBT: ${Math.round(metrics.lcp || 0)} ms / ${metrics.cls ?? 0} / ${Math.round(metrics.tbt || 0)} ms`);
    console.log(`  Report: ${filename}`);

    for (const [category, threshold] of Object.entries(thresholds)) {
      if (
        category === "seo" &&
        !enforceSeoOnAppRoutes &&
        (/^\/auth(?:\/|$|\?)/.test(route) || /^\/dashboard(?:\/|$|\?)/.test(route))
      ) {
        continue;
      }
      const key = category === "bestPractices" ? "best-practices" : category;
      const score = categories[key]?.score ?? 0;
      if (score < threshold) {
        failures.push(`${route} ${category} ${formatScore(score)} < ${formatScore(threshold)}`);
      }
    }
  }

  if (failures.length) {
    console.error("Lighthouse mobile thresholds failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
  }
} finally {
  await chrome.kill();
  if (nextServer) nextServer.kill("SIGTERM");
}
