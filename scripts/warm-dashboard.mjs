const baseUrl = process.env.WARMUP_BASE_URL || "http://127.0.0.1:3000";
const paths = ["/", "/auth", "/dashboard", "/api/health"];

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15_000);

try {
  for (const path of paths) {
    const response = await fetch(`${baseUrl}${path}`, {
      redirect: "manual",
      signal: controller.signal,
      headers: { "x-obaol-warmup": "1" },
    });
    if (response.status >= 500) throw new Error(`${path} returned ${response.status}`);
  }
  console.log("Dashboard warmup completed.");
} finally {
  clearTimeout(timeout);
}
