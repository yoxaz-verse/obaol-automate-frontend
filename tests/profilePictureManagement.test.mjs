import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("profile settings provide upload, crop, replace, and remove controls", () => {
  const profile = read("src/app/dashboard/profile/page.tsx");
  const manager = read("src/components/profile/ProfilePictureManager.tsx");
  assert.match(profile, /ProfilePictureManager/);
  assert.match(manager, /Upload picture/);
  assert.match(manager, /Crop profile picture/);
  assert.match(manager, /Change/);
  assert.match(manager, /Remove picture/);
  assert.match(manager, /image\/jpeg,image\/png,image\/webp/);
  assert.match(manager, /5 \* 1024 \* 1024/);
});

test("session avatars are reused in the profile, top bar, search, and user list", () => {
  const avatar = read("src/components/profile/UserAvatar.tsx");
  assert.match(avatar, /profile-pictures/);
  for (const path of [
    "src/app/dashboard/profile/page.tsx",
    "src/components/dashboard/TopBar.tsx",
    "src/components/dashboard/Users/AssociateSearch.tsx",
    "src/components/dashboard/Users/user-tab-content.tsx",
  ]) assert.match(read(path), /UserAvatar|ProfilePictureManager/);
});
