import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3100";
const startLocalServer = process.env.E2E_SKIP_WEB_SERVER !== "1";
const port = new URL(baseURL).port || "3100";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-pwa-iphone",
      use: {
        ...devices["iPhone 13"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
  ],
  webServer: startLocalServer
    ? {
        command: `next start -p ${port}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
});
