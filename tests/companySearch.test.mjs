import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getNextCompanySearchPage,
  mergeCompanySearchPages,
  parseCompanySearchPage,
} from "../src/components/dashboard/Company/companySearchUtils.ts";

const componentPath = new URL(
  "../src/components/dashboard/Company/CompanySearch.tsx",
  import.meta.url,
);

test("company search parses pagination and stops at the final page", () => {
  const first = parseCompanySearchPage({
    data: { data: { data: [{ _id: "1", name: "Alpha" }], currentPage: 1, totalPages: 2 } },
  });
  const last = parseCompanySearchPage({
    data: { data: { data: [{ _id: "2", name: "Beta" }], currentPage: 2, totalPages: 2 } },
  });

  assert.equal(getNextCompanySearchPage(first), 2);
  assert.equal(getNextCompanySearchPage(last), undefined);
});

test("company search pages are deduplicated and alphabetically ordered", () => {
  const companies = mergeCompanySearchPages([
    { companies: [{ _id: "2", name: "Zulu" }, { _id: "1", name: "beta" }], currentPage: 1, totalPages: 2 },
    { companies: [{ _id: "1", name: "Beta updated" }, { _id: "3", name: "Alpha" }], currentPage: 2, totalPages: 2 },
  ]);

  assert.deepEqual(companies.map((company) => company._id), ["3", "1", "2"]);
  assert.equal(companies[1].name, "Beta updated");
});

test("shared company picker is search-first and requests every result page", async () => {
  const source = await readFile(componentPath, "utf8");

  assert.match(source, /const SEARCH_MIN_LENGTH = 2/);
  assert.match(source, /enabled: searchEnabled/);
  assert.match(source, /useInfiniteQuery/);
  assert.match(source, /page: pageParam/);
  assert.match(source, /search: querySearch/);
  assert.match(source, /fetchNextPage/);
  assert.match(source, /scrollRef=\{scrollRef\}/);
  assert.match(source, /Type at least/);
  assert.match(source, /Try again/);
});
