import test from "node:test";
import assert from "node:assert/strict";
import { groupAssociateServiceLinks } from "../src/utils/associateServiceFamilies.ts";

test("groups links for provided and sought capabilities", () => {
  const groups = groupAssociateServiceLinks([
    "/dashboard/imports",
    "/dashboard/imports/my-listings",
    "/dashboard/quality-labs",
    "/dashboard/packaging",
  ], ["testing"], ["importing-to-india"]);

  assert.deepEqual(groups, [
    { label: "Importing into India", links: ["/dashboard/imports", "/dashboard/imports/my-listings"] },
    { label: "Quality Testing & Labs", links: ["/dashboard/quality-labs"] },
    { label: "Other Services", links: ["/dashboard/packaging"] },
  ]);
});

test("keeps all links under Other Services when no capability matches", () => {
  const links = ["/dashboard/packaging", "/dashboard/quality-labs"];
  assert.deepEqual(groupAssociateServiceLinks(links, [], []), [
    { label: "Other Services", links },
  ]);
});

test("deduplicates shared routes using deterministic family priority", () => {
  const groups = groupAssociateServiceLinks([
    "/dashboard/marketplace",
    "/dashboard/orders",
    "/dashboard/product",
  ], ["seller", "exporting_from_india"], []);

  assert.deepEqual(groups, [
    { label: "Exporting from India", links: ["/dashboard/orders", "/dashboard/product"] },
    { label: "Selling", links: ["/dashboard/marketplace"] },
  ]);
});
