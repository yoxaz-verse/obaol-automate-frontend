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
      testIgnore: /authenticated-flows\.spec\.mjs/,
      use: {
        ...devices["iPhone 13"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
    {
      name: "authenticated-mobile",
      testMatch: /authenticated-flows\.spec\.mjs/,
      use: {
        ...devices["iPhone 13"],
        baseURL: "http://localhost:3100",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
    {
      name: "authenticated-desktop",
      testMatch: /authenticated-flows\.spec\.mjs/,
      use: {
        ...devices["Desktop Safari"],
        baseURL: "http://localhost:3100",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "auth-layout-desktop",
      testMatch: /auth-layout-stability\.spec\.mjs/,
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1366, height: 768 },
      },
    },
  ],
  webServer: startLocalServer
    ? [{
        command: "npm --prefix ../obaol-automate-backend run e2e:server",
        url: "http://127.0.0.1:5001/api/v1/web/registration-options",
        reuseExistingServer: false,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe",
      }, {
        command: `next start -p ${port}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      }]
    : undefined,
});
