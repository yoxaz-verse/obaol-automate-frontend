import { expect, test } from "@playwright/test";

test.use({ browserName: "webkit", isMobile: false, hasTouch: false });

test("key public routes deliver canonical metadata in initial HTML", async ({ request }) => {
  const routes = ["/", "/about", "/export-resources", "/commission-structure", "/methods"];
  const titles = new Set();
  for (const route of routes) {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    const html = await response.text();
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    expect(title, route).toBeTruthy();
    expect(titles.has(title), `duplicate title on ${route}`).toBe(false);
    titles.add(title);
    expect(html).toContain(`<link rel="canonical" href="https://obaol.com${route === "/" ? "" : route}"`);
    expect(html).toMatch(/<meta name="description" content="[^"]+"/);
  }
});

test("private routes deliver noindex and unknown routes retain 404", async ({ request }) => {
  for (const route of ["/auth", "/dashboard", "/verification-pending", "/documents/share/not-a-real-token"]) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    expect(html, route).toMatch(/<meta name="robots" content="[^"]*noindex/);
  }
  const missing = await request.get("/seo-regression-missing-page", { maxRedirects: 0 });
  expect(missing.status()).toBe(404);
  const html = await missing.text();
  expect(html).toContain("404 · Page not found");
  expect(html).not.toContain("router.push");
});

test("sitemap and robots stay consistent", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("<lastmod>");
  expect(sitemap).toContain("https://obaol.com/commission-structure");
  expect(sitemap).toContain("https://obaol.com/methods");
  expect(sitemap).not.toContain("https://obaol.com/dashboard");

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /api");
  expect(robots).not.toContain("Disallow: /dashboard");
  expect(robots).toContain("Sitemap: https://obaol.com/sitemap.xml");
});
