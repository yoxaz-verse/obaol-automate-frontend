const baseUrl = process.env.WARMUP_BASE_URL || "http://127.0.0.1:3000";
// These routes must be present in every production image. Keep admin-only pages
// here as route-existence checks: authentication is enforced client-side after
// the Next.js route has been served.
const paths = ["/", "/auth", "/dashboard", "/dashboard/reports", "/api/health"];

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15_000);

try {
  for (const path of paths) {
    const response = await fetch(`${baseUrl}${path}`, {
      redirect: "manual",
      signal: controller.signal,
      headers: { "x-obaol-warmup": "1" },
    });
    if (response.status >= 400) throw new Error(`${path} returned ${response.status}`);
  }
  console.log("Dashboard warmup completed.");
} finally {
  clearTimeout(timeout);
}
