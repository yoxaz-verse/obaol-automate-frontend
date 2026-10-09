import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("successful shared add forms refresh their owning data view", () => {
  const addModal = read("../src/components/CurdTable/add-model.tsx");
  const addForm = read("../src/components/CurdTable/add-form.tsx");

  assert.equal(addModal.includes("refetchData={refetchData}"), true);
  assert.equal(addForm.includes("refetchData?.();"), true);
});

test("inventory rate mutations refresh status and missing rates are prominent", () => {
  const inventory = read("../src/components/dashboard/Inventory/InventoryList.tsx");
  const commonTable = read("../src/components/CurdTable/common-table.tsx");

  assert.equal(inventory.includes('queryKey: ["inventory-suggested-rates", effectiveCompanyId, user?.id]'), true);
  assert.equal(inventory.includes('getRowClassName={(item: any) =>'), true);
  assert.equal(inventory.includes('"Rate missing"'), true);
  assert.equal(inventory.includes('"No Rate"'), false);
  assert.equal(commonTable.includes("getRowClassName?.(item)"), true);
});
