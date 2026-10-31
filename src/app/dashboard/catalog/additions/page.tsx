"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Autocomplete, AutocompleteItem, Button, Chip, Input, Textarea } from "@nextui-org/react";
import { FiBox, FiCheck, FiChevronRight, FiFolder, FiLayers, FiPackage, FiRefreshCw } from "react-icons/fi";
import { deleteDataBody, getData, patchData, postData } from "@/core/api/apiHandler";
import { catalogModerationRoutes } from "@/core/api/apiRoutes";
import { fetchCatalogHierarchyOptions, filterCatalogHierarchyOptions, type CatalogHierarchyOption } from "@/utils/catalogHierarchy";
import { showToastMessage } from "@/utils/utils";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import { DashboardPage, DashboardPanel, DashboardSectionHeader } from "@/components/dashboard/DashboardUI";

type EntityType = "category" | "subCategory" | "product" | "productVariant";
type CatalogRow = Record<string, any> & { entityType: EntityType; entityLabel: string };
type TypeDefinition = { key: EntityType; label: string; description: string; example: string; parent?: EntityType; parentField?: string; icon: ReactNode };

const TYPES: TypeDefinition[] = [
  { key: "category", label: "Category", description: "A top-level group for related products.", example: "Packaging", icon: <FiFolder /> },
  { key: "subCategory", label: "Subcategory", description: "A focused group inside a category.", example: "Flexible packaging", parent: "category", parentField: "category", icon: <FiLayers /> },
  { key: "product", label: "Product", description: "The item sellers list and trade.", example: "Pouch", parent: "subCategory", parentField: "subCategory", icon: <FiPackage /> },
  { key: "productVariant", label: "Variant", description: "A specific version of a product.", example: "Stand-up pouch", parent: "product", parentField: "product", icon: <FiBox /> },
];
const TYPE_RANK: Record<EntityType, number> = { category: 0, subCategory: 1, product: 2, productVariant: 3 };
const definitionFor = (type: EntityType) => TYPES.find((item) => item.key === type)!;
const hierarchySortPath = (row: CatalogRow) => {
  if (row.entityType === "category") return "";
  const hierarchy = row.hierarchy || {};
  return [
    hierarchy.subCategory?.name || (row.entityType === "subCategory" ? row.name : ""),
    hierarchy.product?.name || (row.entityType === "product" ? row.name : ""),
    hierarchy.productVariant?.name || (row.entityType === "productVariant" ? row.name : ""),
  ].filter(Boolean).join(" / ");
};
const statusColor = (status: string) => status === "APPROVED" ? "success" : status === "REJECTED" ? "danger" : status === "PENDING_REVIEW" ? "warning" : "default";
const humanStatus = (status: string) => status.replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
const optionLabel = (item: CatalogHierarchyOption) => `${item.name}${item.approvalStatus !== "APPROVED" ? ` · ${humanStatus(item.approvalStatus)}` : ""}`;

type CatalogHierarchyAutocompleteProps = {
  describedBy: string;
  emptyContent: string;
  isDisabled: boolean;
  isLoading: boolean;
  label: string;
  onSelectionChange: (key: string) => void;
  options: CatalogHierarchyOption[];
  placeholder: string;
  selectedKey: string;
};

function CatalogHierarchyAutocomplete({ describedBy, emptyContent, isDisabled, isLoading, label, onSelectionChange, options, placeholder, selectedKey }: CatalogHierarchyAutocompleteProps) {
  const selectedName = options.find((option) => option.id === selectedKey)?.name || "";
  const [query, setQuery] = useState(selectedName);
  const effectiveQuery = query === selectedName ? "" : query;
  const filteredOptions = useMemo(() => filterCatalogHierarchyOptions(options, effectiveQuery), [options, effectiveQuery]);

  useEffect(() => {
    setQuery(selectedName);
  }, [selectedKey, selectedName]);

  return <Autocomplete aria-describedby={describedBy} label={label} labelPlacement="outside" placeholder={placeholder} isLoading={isLoading} isDisabled={isDisabled} items={filteredOptions} selectedKey={selectedKey || null} inputValue={query} allowsCustomValue={false} listboxProps={{ emptyContent }} onInputChange={setQuery} onSelectionChange={(key) => { const id = String(key || ""); setQuery(options.find((option) => option.id === id)?.name || ""); onSelectionChange(id); }}>{(item) => <AutocompleteItem key={item.id} textValue={item.name}>{optionLabel(item)}</AutocompleteItem>}</Autocomplete>;
}

function Notice({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "danger" }) {
  return <div className={`rounded-xl border p-3 text-sm leading-6 ${tone === "danger" ? "border-danger-500/30 bg-danger-500/10 text-danger-600" : "border-obaol-500/25 bg-obaol-500/5 text-default-600"}`}>{children}</div>;
}

export default function CatalogAdditionsPage() {
  const client = useQueryClient();
  const [type, setType] = useState<EntityType>("category");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [editing, setEditing] = useState<CatalogRow | null>(null);
  const definition = definitionFor(type);

  const mine = useQuery({ queryKey: ["catalog-additions"], queryFn: async () => (await getData(catalogModerationRoutes.mine))?.data?.data || {} });
  const categories = useQuery({ queryKey: ["catalog-builder", "categories"], queryFn: () => fetchCatalogHierarchyOptions() });
  const subCategories = useQuery({ queryKey: ["catalog-builder", "subcategories", categoryId], enabled: Boolean(categoryId), queryFn: () => fetchCatalogHierarchyOptions({ key: "category", id: categoryId }) });
  const products = useQuery({ queryKey: ["catalog-builder", "products", subCategoryId], enabled: Boolean(subCategoryId), queryFn: () => fetchCatalogHierarchyOptions({ key: "subCategory", id: subCategoryId }) });

  const rows = useMemo<CatalogRow[]>(() => TYPES.flatMap(({ key, label }) => (mine.data?.[key] || []).map((row: any) => ({ ...row, entityType: key, entityLabel: label }))), [mine.data]);
  const groups = useMemo(() => {
    const grouped = new Map<string, { id: string; name: string; rows: CatalogRow[] }>();
    rows.forEach((row) => {
      const category = row.entityType === "category" ? row : row.hierarchy?.category;
      const id = String(category?._id || row.category || (row.entityType === "category" ? row._id : "unassigned"));
      const group = grouped.get(id) || { id, name: category?.name || (row.entityType === "category" ? row.name : "Category unavailable"), rows: [] };
      group.rows.push(row);
      grouped.set(id, group);
    });
    return Array.from(grouped.values())
      .map((group) => ({ ...group, rows: group.rows.sort((a, b) => hierarchySortPath(a).localeCompare(hierarchySortPath(b)) || TYPE_RANK[a.entityType] - TYPE_RANK[b.entityType]) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const selectedCategory = (categories.data || []).find((item) => item.id === categoryId)?.name || editing?.hierarchy?.category?.name || "";
  const selectedSubCategory = (subCategories.data || []).find((item) => item.id === subCategoryId)?.name || editing?.hierarchy?.subCategory?.name || "";
  const selectedProduct = (products.data || []).find((item) => item.id === parentId)?.name || editing?.hierarchy?.product?.name || "";
  const previewParts = [type !== "category" && selectedCategory, ["product", "productVariant"].includes(type) && selectedSubCategory, type === "productVariant" && selectedProduct, name.trim() || definition.label].filter(Boolean) as string[];

  const resetForm = () => { setName(""); setDescription(""); setParentId(""); setCategoryId(""); setSubCategoryId(""); setEditing(null); };
  const changeType = (nextType: EntityType) => { setType(nextType); setParentId(""); setCategoryId(""); setSubCategoryId(""); };

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { name: name.trim(), description: description.trim() || name.trim() };
      if (definition.parentField) payload[definition.parentField] = parentId;
      return editing ? patchData(catalogModerationRoutes.update(type, editing._id), payload) : postData(catalogModerationRoutes.create(type), payload);
    },
    onSuccess: () => { showToastMessage({ type: "success", message: editing ? "Draft updated." : "Catalog draft created." }); resetForm(); client.invalidateQueries({ queryKey: ["catalog-additions"] }); },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Could not save catalog addition." }),
  });
  const submit = useMutation({
    mutationFn: ({ entityType, id }: any) => postData(catalogModerationRoutes.submit(entityType, id), {}),
    onSuccess: () => { showToastMessage({ type: "success", message: "Submitted for admin review." }); client.invalidateQueries({ queryKey: ["catalog-additions"] }); },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Could not submit." }),
  });
  const remove = useMutation({
    mutationFn: async ({ entityType, id, name: itemName }: any) => {
      const preview = (await getData(catalogModerationRoutes.deletePreview(entityType, id)))?.data?.data;
      const counts = preview?.counts || {};
      const summary = Object.entries(counts).filter(([, count]) => Number(count) > 0).map(([key, count]) => `${count} ${key}`).join(", ");
      if (!window.confirm(`Delete ${itemName}?${summary ? ` This also removes ${summary}.` : ""}`)) return null;
      return deleteDataBody(catalogModerationRoutes.remove(entityType, id), {}, { confirm: true });
    },
    onSuccess: (result) => { if (!result) return; showToastMessage({ type: "success", message: "Private catalog addition removed." }); client.invalidateQueries({ queryKey: ["catalog-additions"] }); },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Could not delete catalog addition." }),
  });

  const startEdit = (row: CatalogRow) => {
    const nextCategoryId = String(row.hierarchy?.category?._id || row.category || (row.entityType === "category" ? row._id : ""));
    const nextSubCategoryId = String(row.hierarchy?.subCategory?._id || row.subCategory || (row.entityType === "subCategory" ? row._id : ""));
    const nextParentId = row.entityType === "subCategory" ? nextCategoryId : row.entityType === "product" ? nextSubCategoryId : row.entityType === "productVariant" ? String(row.hierarchy?.product?._id || row.product || "") : "";
    setEditing(row); setType(row.entityType); setName(row.name || ""); setDescription(row.description || ""); setCategoryId(nextCategoryId); setSubCategoryId(nextSubCategoryId); setParentId(nextParentId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const optionError = (label: string, retry: () => void) => <Notice tone="danger"><span>{label} could not be loaded. </span><button type="button" onClick={retry} className="inline-flex items-center gap-1 font-bold underline"><FiRefreshCw /> Retry</button></Notice>;
  const renderRow = (row: CatalogRow) => {
    const status = String(row.approvalStatus || "APPROVED");
    const locked = status === "APPROVED";
    const path = [row.hierarchy?.category?.name, row.hierarchy?.subCategory?.name, row.hierarchy?.product?.name, row.hierarchy?.productVariant?.name].filter(Boolean).join(" › ");
    const depth = TYPE_RANK[row.entityType];
    return <article key={`${row.entityType}-${row._id}`} className="relative rounded-xl border border-default-200 bg-content1 p-4 md:ml-[var(--catalog-depth)]" style={{ "--catalog-depth": `${Math.min(depth, 3) * 24}px` } as CSSProperties}>
      {depth > 0 && <span aria-hidden className="absolute -left-4 top-0 hidden h-1/2 w-4 rounded-bl-lg border-b border-l border-default-300 md:block" />}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-default-400">{definitionFor(row.entityType).icon}</span><h3 className="font-bold">{row.name}</h3><Chip size="sm" color={statusColor(status) as any} variant="flat">{humanStatus(status)}</Chip><Chip size="sm" variant="bordered">{row.entityLabel}</Chip></div><p className="mt-1 break-words text-xs text-default-500">{path || row.name}</p>{row.description && <p className="mt-2 text-sm text-default-600">{row.description}</p>}<p className="mt-2 text-xs font-semibold">{row.moderation?.effectiveVisibility ? "Publicly eligible" : "Private — catalog approval pending"} · {row.listingCount || 0} listings</p>{row.reviewNotes && <p className="mt-2 rounded-lg bg-danger-500/10 p-2 text-sm text-danger">Admin note: {row.reviewNotes}</p>}</div>
        <div className="flex flex-wrap gap-2 lg:justify-end">{!locked && <Button size="sm" variant="flat" onPress={() => startEdit(row)}>Edit</Button>}{["DRAFT", "REJECTED"].includes(status) && <Button size="sm" color="warning" isLoading={submit.isPending} onPress={() => submit.mutate({ entityType: row.entityType, id: row._id })}>Submit</Button>}{!locked && <Button size="sm" color="danger" variant="flat" isLoading={remove.isPending} onPress={() => remove.mutate({ entityType: row.entityType, id: row._id, name: row.name })}>Delete</Button>}{locked && <Chip size="sm" color="success"><FiCheck className="mr-1" /> Locked after approval</Chip>}</div>
      </div>
    </article>;
  };

  return <DashboardPage className="w-full space-y-6 p-4 md:p-8">
    <PageHeader variant="plain" eyebrowTone="warning" eyebrow="Private catalog builder" title="My Catalog Additions" description="Build categories, products, and variants privately. Your live rates remain private until the complete hierarchy is approved." actions={<Button as={Link} href="/dashboard/product" variant="flat">Return to trade listings</Button>} />
    <DashboardPanel className="mx-auto w-full max-w-5xl overflow-hidden">
      <div className="border-b border-default-200 p-5 md:p-6"><DashboardSectionHeader title={editing ? `Edit ${editing.name}` : "Add to your catalog"} description="Choose what you are adding, place it in the hierarchy, then save it as a private draft." /></div>
      <div className="space-y-6 p-5 md:p-6">
        <section aria-labelledby="item-type-heading"><div className="mb-3"><h3 id="item-type-heading" className="font-bold">1. What do you want to add?</h3><p className="mt-1 text-sm text-default-500">Start with the kind of catalog item you are creating.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{TYPES.map((item) => { const selected = type === item.key; return <button key={item.key} type="button" disabled={Boolean(editing)} aria-pressed={selected} onClick={() => changeType(item.key)} className={`min-h-32 rounded-2xl border p-4 text-left transition ${selected ? "border-obaol-500 bg-obaol-500/10 ring-2 ring-obaol-500/15" : "border-default-200 bg-content1 hover:border-obaol-500/50"} disabled:cursor-not-allowed disabled:opacity-70`}><span className={`grid h-9 w-9 place-items-center rounded-xl ${selected ? "bg-obaol-500 text-obaol-950" : "bg-default-100 text-default-600"}`}>{item.icon}</span><strong className="mt-3 block">{item.label}</strong><span className="mt-1 block text-xs leading-5 text-default-500">{item.description}</span></button>; })}</div>{editing && <p className="mt-2 text-xs text-default-500">Item type is fixed while editing. Cancel this edit to create a different type.</p>}</section>

        <section aria-labelledby="placement-heading" className="rounded-2xl border border-default-200 bg-default-50/50 p-4 md:p-5">
          <div className="mb-4"><h3 id="placement-heading" className="font-bold">2. Where does it belong?</h3><p className="mt-1 text-sm text-default-500">{type === "category" ? "Categories sit at the top level and do not need a parent." : "Choose each parent in order so sellers can find the item in the right place."}</p></div>
          {type === "category" ? <Notice><strong>{name.trim() || "Your category"}</strong> will be created as a new top-level catalog group.</Notice> : <div className="flex flex-col gap-5">
            {categories.isError ? optionError("Categories", () => categories.refetch()) : <div className="catalog-hierarchy-field flex flex-col gap-1">
              <CatalogHierarchyAutocomplete describedBy="catalog-category-help" label="Category" placeholder={categories.isLoading ? "Loading categories…" : "Search categories"} isLoading={categories.isLoading} isDisabled={categories.isLoading || !categories.data?.length} options={categories.data || []} selectedKey={categoryId} emptyContent="No matching categories." onSelectionChange={(id) => { setCategoryId(id); setSubCategoryId(""); setParentId(type === "subCategory" ? id : ""); }} />
              <p id="catalog-category-help" className="px-1 text-xs leading-5 text-default-500">{!categories.isLoading && !categories.data?.length ? "No categories are available yet. Create a category first." : "Top-level catalog group"}</p>
            </div>}
            {["product", "productVariant"].includes(type) && (subCategories.isError ? optionError("Subcategories", () => subCategories.refetch()) : <div className="catalog-hierarchy-field flex flex-col gap-1">
              <CatalogHierarchyAutocomplete describedBy="catalog-subcategory-help" label="Subcategory" placeholder={!categoryId ? "Choose a category first" : subCategories.isLoading ? "Loading subcategories…" : "Search subcategories"} isLoading={subCategories.isLoading} isDisabled={!categoryId || subCategories.isLoading || !subCategories.data?.length} options={subCategories.data || []} selectedKey={subCategoryId} emptyContent="No matching subcategories." onSelectionChange={(id) => { setSubCategoryId(id); setParentId(type === "product" ? id : ""); }} />
              <p id="catalog-subcategory-help" className="px-1 text-xs leading-5 text-default-500">{categoryId && !subCategories.isLoading && !subCategories.data?.length ? "This category has no subcategories yet. Add one before creating a product." : "Narrow the item to a specific group"}</p>
            </div>)}
            {type === "productVariant" && (products.isError ? optionError("Products", () => products.refetch()) : <div className="catalog-hierarchy-field flex flex-col gap-1">
              <CatalogHierarchyAutocomplete describedBy="catalog-product-help" label="Product" placeholder={!subCategoryId ? "Choose a subcategory first" : products.isLoading ? "Loading products…" : "Search products"} isLoading={products.isLoading} isDisabled={!subCategoryId || products.isLoading || !products.data?.length} options={products.data || []} selectedKey={parentId} emptyContent="No matching products." onSelectionChange={setParentId} />
              <p id="catalog-product-help" className="px-1 text-xs leading-5 text-default-500">{subCategoryId && !products.isLoading && !products.data?.length ? "This subcategory has no products yet. Add one before creating a variant." : "The product this variant belongs to"}</p>
            </div>)}
          </div>}
          <div className="mt-4 rounded-xl border border-dashed border-default-300 bg-content1 p-3"><p className="text-[11px] font-bold tracking-wider text-default-500">Hierarchy preview</p><div className="mt-2 flex flex-wrap items-center gap-1 text-sm font-semibold">{previewParts.map((part, index) => <span key={`${part}-${index}`} className="inline-flex items-center gap-1">{index > 0 && <FiChevronRight className="text-default-400" />}<span className={index === previewParts.length - 1 ? "text-obaol-600 dark:text-obaol-300" : ""}>{part}</span></span>)}</div></div>
        </section>

        <section aria-labelledby="details-heading"><div className="mb-3"><h3 id="details-heading" className="font-bold">3. Item details</h3><p className="mt-1 text-sm text-default-500">Give sellers a clear, recognizable name. You can add more detail if needed.</p></div><div className="grid gap-4 md:grid-cols-2"><Input label={`${definition.label} name`} labelPlacement="outside" isRequired placeholder={`e.g. ${definition.example}`} value={name} onValueChange={setName} /><Textarea label="Description (optional)" labelPlacement="outside" placeholder={`Add a short explanation of this ${definition.label.toLowerCase()}.`} description="If left blank, the item name will be used." value={description} onValueChange={setDescription} minRows={3} /></div></section>
        <Notice>Drafts stay private. When the hierarchy is ready, submit each draft for admin review; approved items become eligible for catalog listings.</Notice>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-default-200 bg-default-50/60 p-4 sm:flex-row sm:items-center sm:justify-between md:px-6"><p className="text-xs text-default-500">{definition.parent && !parentId ? `Choose a parent ${definition.parent === "subCategory" ? "subcategory" : definition.parent} to continue.` : name.trim() ? "Ready to save as a private draft." : "Enter a name to continue."}</p><div className="flex gap-2 sm:justify-end">{editing && <Button variant="light" onPress={resetForm}>Cancel</Button>}<Button className="flex-1 sm:flex-none" color="warning" isLoading={save.isPending} isDisabled={!name.trim() || Boolean(definition.parent && !parentId)} onPress={() => save.mutate()}>{editing ? "Save changes" : "Save draft"}</Button></div></div>
    </DashboardPanel>

    <section className="mx-auto w-full max-w-5xl space-y-4">
      <DashboardSectionHeader title="Your hierarchy" description="Your additions are grouped by category so you can see where every item belongs." action={<span className="text-sm text-default-500">{rows.length} additions</span>} />
      {mine.isLoading ? <LoadingState compact title="Loading your additions" /> : rows.length === 0 ? <EmptyState title="No private catalog additions yet" message="Create a category above, then add its subcategories, products, and variants." /> : <div className="space-y-4">{groups.map((group) => { const hasCategoryRow = group.rows.some((row) => row.entityType === "category"); const childRows = group.rows.filter((row) => row.entityType !== "category"); return <DashboardPanel key={group.id} className="overflow-hidden"><div className="flex items-center justify-between gap-3 border-b border-default-200 bg-default-50/60 px-4 py-3 md:px-5"><div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-obaol-500/10 text-obaol-600"><FiFolder /></span><div className="min-w-0"><h3 className="truncate font-bold">{group.name}</h3><p className="text-xs text-default-500">{childRows.length ? `${childRows.length} nested ${childRows.length === 1 ? "item" : "items"}` : "Top-level category"}</p></div></div>{!hasCategoryRow && <Chip size="sm" variant="flat">Existing category</Chip>}</div><div className="space-y-3 p-3 md:p-4">{group.rows.map(renderRow)}{hasCategoryRow && !childRows.length && <div className="rounded-xl border border-dashed border-default-300 p-4 text-sm text-default-500">This category has no subcategories yet. Choose “Subcategory” above to add its first child.</div>}</div></DashboardPanel>; })}</div>}
    </section>
  </DashboardPage>;
}
