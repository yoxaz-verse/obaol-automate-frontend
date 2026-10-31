import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Flutter shell restricts embedded navigation and release cleartext", () => {
  const policy = read("mobile/lib/navigation_policy.dart");
  const manifest = read("mobile/android/app/src/main/AndroidManifest.xml");
  assert.match(policy, /AppConfig\.isTrusted/);
  assert.match(policy, /NavigationAction\.external/);
  assert.match(policy, /NavigationAction\.reject/);
  assert.match(manifest, /usesCleartextTraffic="false"/);
  assert.match(manifest, /android:autoVerify="true"/);
});

test("Flutter shell exposes the native identity bridge and persistent cookie", () => {
  const auth = read("mobile/lib/native_auth.dart");
  const main = read("mobile/lib/main.dart");
  assert.match(main, /handlerName: 'obaolAuth'/);
  assert.match(main, /sharedCookiesEnabled: true/);
  assert.match(auth, /GoogleSignIn/);
  assert.match(auth, /SignInWithApple/);
  assert.match(auth, /isHttpOnly: true/);
  assert.match(auth, /sameSite: HTTPCookieSameSitePolicy\.NONE/);
});

test("mobile release configuration uses the permanent OBAOL identity", () => {
  const android = read("mobile/android/app/build.gradle");
  const entitlements = read("mobile/ios/Runner/Runner.entitlements");
  const readme = read("mobile/README.md");
  assert.match(android, /applicationId "com\.obaol\.app"/);
  assert.match(entitlements, /com\.apple\.developer\.applesignin/);
  assert.match(entitlements, /applinks:www\.obaol\.com/);
  assert.match(readme, /com\.obaol\.app/);
});
