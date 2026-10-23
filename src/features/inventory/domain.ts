type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

export const idOf = (value: unknown): string => {
  const record = asRecord(value);
  return String(record._id ?? record.id ?? value ?? "").trim();
};

const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;
export const normalizeObjectId = (value: unknown): string => {
  const id = idOf(value);
  return OBJECT_ID_PATTERN.test(id) ? id : "";
};

export const daysStored = (storedAt: unknown, now = Date.now()): number | null => {
  if (!storedAt) return null;
  const timestamp = new Date(storedAt as string | number | Date).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(1, Math.floor((now - timestamp) / 86_400_000));
};

export const unwrapInventoryList = (response: unknown): UnknownRecord[] => {
  const root = asRecord(response);
  const data = root.data;
  const nested = asRecord(data).data;
  const deeplyNested = asRecord(nested).data;
  const rows = [deeplyNested, nested, data, response].find(Array.isArray);
  return (rows as UnknownRecord[] | undefined) ?? [];
};

export type InventoryPresentationRow = UnknownRecord & {
  product: string;
  productVariant: string;
  associate: string;
  associateId: unknown;
  associateCompanyId: unknown;
  productVariantId: unknown;
  productId: unknown;
  stateId: unknown;
  districtId: unknown;
  divisionId: unknown;
  pincodeEntryId: unknown;
  linkedVariantRateId: unknown;
  reservedQty: number;
  availableQty: number;
};

export type InventorySummaryRow = {
  key: string;
  name: string;
  company: string;
  totalQty: number;
  warehouses: Set<string>;
  reservedQty: number;
};

export const buildInventoryPresentation = (params: {
  inventory: unknown;
  reservations: unknown;
  warehouses: unknown;
  rates: unknown;
  companyId?: string | null;
}) => {
  const reservations = unwrapInventoryList(params.reservations);
  const reservedByInventoryId = new Map<string, number>();
  const reservedByVariantKey = new Map<string, number>();
  for (const reservation of reservations) {
    const inventoryId = idOf(reservation.inventoryId);
    const variantId = idOf(reservation.productVariant);
    const companyId = idOf(reservation.associateCompany);
    const quantity = Number(reservation.quantity || 0);
    if (inventoryId) reservedByInventoryId.set(inventoryId, (reservedByInventoryId.get(inventoryId) || 0) + quantity);
    if (variantId) {
      const key = `${variantId}::${companyId}`;
      reservedByVariantKey.set(key, (reservedByVariantKey.get(key) || 0) + quantity);
    }
  }

  const tableData: InventoryPresentationRow[] = unwrapInventoryList(params.inventory).map((item) => {
    const inventoryId = idOf(item);
    const reservedQty = reservedByInventoryId.get(inventoryId) || 0;
    const quantity = Number(item.quantity || 0);
    const product = asRecord(item.product);
    const variant = asRecord(item.productVariant);
    const associate = asRecord(item.associate);
    const company = asRecord(item.associateCompany);
    return {
      ...item,
      product: String(product.name ?? "N/A"),
      productVariant: String(variant.name ?? "N/A"),
      associate: String(company.name ?? associate.name ?? "OBAOL"),
      associateId: associate._id ?? item.associate,
      associateCompanyId: company._id ?? item.associateCompany,
      productVariantId: variant._id ?? item.productVariant,
      productId: product._id ?? item.product,
      stateId: asRecord(item.state)._id ?? item.state,
      districtId: asRecord(item.district)._id ?? item.district,
      divisionId: asRecord(item.division)._id ?? item.division,
      pincodeEntryId: asRecord(item.pincodeEntry)._id ?? item.pincodeEntry,
      linkedVariantRateId: asRecord(item.linkedVariantRate)._id ?? item.linkedVariantRate,
      reservedQty,
      availableQty: Math.max(0, quantity - reservedQty),
    };
  });

  const warehouseMap = new Map<string, UnknownRecord>();
  for (const warehouse of unwrapInventoryList(params.warehouses)) {
    const id = idOf(warehouse);
    if (id) warehouseMap.set(id, warehouse);
  }

  const summaryMap = new Map<string, InventorySummaryRow>();
  for (const row of tableData) {
    const key = `${row.productVariantId}::${row.associateCompanyId || ""}`;
    if (!summaryMap.has(key)) summaryMap.set(key, {
      key,
      name: row.productVariant,
      company: row.associate,
      totalQty: 0,
      warehouses: new Set<string>(),
      reservedQty: reservedByVariantKey.get(key) || 0,
    });
    const summary = summaryMap.get(key)!;
    summary.totalQty += Number(row.quantity || 0);
    if (row.warehouseName) summary.warehouses.add(String(row.warehouseName));
  }

  const inventoryKeys = new Set(tableData.map((row) => `${row.productVariantId}::${row.associateCompanyId || ""}`));
  const rateRows = unwrapInventoryList(params.rates);
  const rateMap = new Map<string, UnknownRecord>();
  const rateById = new Map<string, UnknownRecord>();
  for (const rate of rateRows) {
    const variantId = idOf(rate.productVariant);
    const companyId = idOf(rate.associateCompany);
    const rateId = idOf(rate);
    if (rateId) rateById.set(rateId, rate);
    if (variantId) rateMap.set(`${variantId}::${companyId}`, rate);
  }
  const suggestedRates = rateRows.filter((rate) => {
    const variantId = idOf(rate.productVariant);
    const companyId = idOf(rate.associateCompany);
    if (!variantId) return false;
    if (params.companyId && companyId !== String(params.companyId)) return false;
    return !inventoryKeys.has(`${variantId}::${companyId}`);
  });

  return { tableData, reservationRows: reservations, summaryRows: [...summaryMap.values()], warehouseMap, rateMap, rateById, suggestedRates };
};
