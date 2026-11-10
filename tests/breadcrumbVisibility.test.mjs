import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("site breadcrumbs use readable theme colors and visible focus states", () => {
  const breadcrumbSources = [
    "src/components/ui/PageHeader.tsx",
    "src/components/dashboard/DashboardBreadcrumb.tsx",
    "src/components/dashboard/DashboardContextBar.tsx",
    "src/components/dashboard/Catalog/catalog-breadcrumbs.tsx",
    "src/components/public/ScenarioPageView.tsx",
    "src/app/dashboard/enquiries/[id]/page.tsx",
  ].map(read);

  for (const source of breadcrumbSources) {
    assert.match(source, /text-default-700/, "breadcrumb links must use the readable secondary foreground");
    assert.match(source, /text-foreground/, "the current breadcrumb must use the full foreground color");
    assert.match(source, /focus-visible:ring-2/, "breadcrumb controls must expose a keyboard focus ring");
  }
});

test("the enquiry breadcrumb does not use orange as its default text color", () => {
  const source = read("src/app/dashboard/enquiries/[id]/page.tsx");
  const breadcrumb = source.slice(source.indexOf("<Breadcrumbs"), source.indexOf("</Breadcrumbs>") + "</Breadcrumbs>".length);

  assert.doesNotMatch(breadcrumb, /color="primary"/);
  assert.match(breadcrumb, /data-\[current=true\]:text-foreground/);
  assert.match(breadcrumb, /separator: "text-default-600"/);
});
