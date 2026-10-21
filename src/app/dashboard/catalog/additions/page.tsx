"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Chip, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { deleteDataBody, getData, patchData, postData } from "@/core/api/apiHandler";
import { catalogModerationRoutes } from "@/core/api/apiRoutes";
import { fetchCatalogHierarchyOptions, type CatalogHierarchyOption } from "@/utils/catalogHierarchy";
import { showToastMessage } from "@/utils/utils";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import { DashboardPage, DashboardPanel, DashboardSectionHeader } from "@/components/dashboard/DashboardUI";

type EntityType = "category" | "subCategory" | "product" | "productVariant";
const TYPES: Array<{ key: EntityType; label: string; parent?: EntityType; parentField?: string }> = [
  { key: "category", label: "Category" },
  { key: "subCategory", label: "Subcategory", parent: "category", parentField: "category" },
  { key: "product", label: "Product", parent: "subCategory", parentField: "subCategory" },
  { key: "productVariant", label: "Variant", parent: "product", parentField: "product" },
];

const statusColor = (status: string) => status === "APPROVED" ? "success" : status === "REJECTED" ? "danger" : status === "PENDING_REVIEW" ? "warning" : "default";

export default function CatalogAdditionsPage() {
  const client = useQueryClient();
  const [type, setType] = useState<EntityType>("category");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const definition = TYPES.find((item) => item.key === type)!;
  const mine = useQuery({ queryKey: ["catalog-additions"], queryFn: async () => (await getData(catalogModerationRoutes.mine))?.data?.data || {} });
  const categories = useQuery({ queryKey: ["catalog-builder", "categories"], queryFn: () => fetchCatalogHierarchyOptions() });
  const subCategories = useQuery({ queryKey: ["catalog-builder", "subcategories", categoryId], enabled: Boolean(categoryId), queryFn: () => fetchCatalogHierarchyOptions({ key: "category", id: categoryId }) });
  const products = useQuery({ queryKey: ["catalog-builder", "products", subCategoryId], enabled: Boolean(subCategoryId), queryFn: () => fetchCatalogHierarchyOptions({ key: "subCategory", id: subCategoryId }) });
  const rows = useMemo(() => TYPES.flatMap(({ key, label }) => (mine.data?.[key] || []).map((row: any) => ({ ...row, entityType: key, entityLabel: label }))), [mine.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { name: name.trim(), description: description.trim() || name.trim() };
      if (definition.parentField) payload[definition.parentField] = parentId;
      return editing
        ? patchData(catalogModerationRoutes.update(type, editing._id), payload)
        : postData(catalogModerationRoutes.create(type), payload);
    },
    onSuccess: () => { showToastMessage({ type: "success", message: editing ? "Draft updated." : "Catalog draft created." }); setName(""); setDescription(""); setParentId(""); setEditing(null); client.invalidateQueries({ queryKey: ["catalog-additions"] }); },
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
  const startEdit = (row: any) => { setEditing(row); setType(row.entityType); setName(row.name || ""); setDescription(row.description || ""); setCategoryId(String(row.hierarchy?.category?._id || row.category || "")); setSubCategoryId(String(row.hierarchy?.subCategory?._id || row.subCategory || "")); setParentId(String(row.product || "")); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <DashboardPage className="w-full space-y-7 p-6 md:p-10">
    <PageHeader variant="plain" eyebrowTone="warning" eyebrow="Private catalog builder" title="My Catalog Additions" description="Build categories, products, and variants privately. Your live rates remain private until the complete hierarchy is approved." actions={<Button as={Link} href="/dashboard/product" variant="flat">Return to trade listings</Button>} />
    <DashboardPanel className="space-y-4 p-5">
      <DashboardSectionHeader title={editing ? `Edit ${editing.name}` : "Add a directory item"} />
      <div className="grid gap-3 md:grid-cols-2">
        <Select label="Item type" selectedKeys={[type]} isDisabled={Boolean(editing)} onSelectionChange={(keys) => { setType(String(Array.from(keys)[0]) as EntityType); setParentId(""); setCategoryId(""); setSubCategoryId(""); }}>{TYPES.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}</Select>
        {type !== "category" && <Select label="Parent category" selectedKeys={categoryId ? [categoryId] : []} onSelectionChange={(keys) => { const id = String(Array.from(keys)[0] || ""); setCategoryId(id); setSubCategoryId(""); setParentId(type === "subCategory" ? id : ""); }}>{(categories.data || []).map((item: CatalogHierarchyOption) => <SelectItem key={item.id}>{item.name}{item.approvalStatus !== "APPROVED" ? ` · ${item.approvalStatus.replaceAll("_", " ")}` : ""}</SelectItem>)}</Select>}
        {["product", "productVariant"].includes(type) && <Select label="Parent subcategory" isDisabled={!categoryId} selectedKeys={subCategoryId ? [subCategoryId] : []} onSelectionChange={(keys) => { const id = String(Array.from(keys)[0] || ""); setSubCategoryId(id); setParentId(type === "product" ? id : ""); }}>{(subCategories.data || []).map((item: CatalogHierarchyOption) => <SelectItem key={item.id}>{item.name}{item.approvalStatus !== "APPROVED" ? ` · ${item.approvalStatus.replaceAll("_", " ")}` : ""}</SelectItem>)}</Select>}
        {type === "productVariant" && <Select label="Parent product" isDisabled={!subCategoryId} selectedKeys={parentId ? [parentId] : []} onSelectionChange={(keys) => setParentId(String(Array.from(keys)[0] || ""))}>{(products.data || []).map((item: CatalogHierarchyOption) => <SelectItem key={item.id}>{item.name}{item.approvalStatus !== "APPROVED" ? ` · ${item.approvalStatus.replaceAll("_", " ")}` : ""}</SelectItem>)}</Select>}
        <Input label="Name" value={name} onValueChange={setName} />
        <Textarea label="Description" value={description} onValueChange={setDescription} />
      </div>
      <div className="flex justify-end gap-2">{editing && <Button variant="light" onPress={() => { setEditing(null); setName(""); setDescription(""); setParentId(""); }}>Cancel</Button>}<Button color="warning" isLoading={save.isPending} isDisabled={!name.trim() || Boolean(definition.parent && !parentId)} onPress={() => save.mutate()}>{editing ? "Save changes" : "Save draft"}</Button></div>
    </DashboardPanel>
    <section className="space-y-3">
      <DashboardSectionHeader title="Your hierarchy" action={<span className="text-sm text-default-500">{rows.length} additions</span>} />
      {mine.isLoading ? <LoadingState compact title="Loading your additions" /> : rows.length === 0 ? <EmptyState title="No private catalog additions yet" message="Add a directory item above to begin building your private hierarchy." /> : rows.map((row: any) => {
        const status = String(row.approvalStatus || "APPROVED"); const locked = status === "APPROVED";
        const path = [row.hierarchy?.category?.name, row.hierarchy?.subCategory?.name, row.hierarchy?.product?.name, row.hierarchy?.productVariant?.name].filter(Boolean).join(" › ");
        return <article key={`${row.entityType}-${row._id}`} className="rounded-2xl border border-default-200 bg-content1 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{row.name}</h3><Chip size="sm" color={statusColor(status) as any} variant="flat">{status.replaceAll("_", " ")}</Chip><Chip size="sm" variant="bordered">{row.entityLabel}</Chip></div><p className="mt-1 text-xs text-default-500">{path || row.name}</p><p className="mt-2 text-sm text-default-600">{row.description}</p><p className="mt-2 text-xs font-semibold">{row.moderation?.effectiveVisibility ? "Publicly eligible" : "Private — catalog approval pending"} · {row.listingCount || 0} listings</p>{row.reviewNotes && <p className="mt-2 text-sm text-danger">Admin note: {row.reviewNotes}</p>}</div>
          <div className="flex flex-wrap gap-2">{!locked && <Button size="sm" variant="flat" onPress={() => startEdit(row)}>Edit</Button>}{["DRAFT", "REJECTED"].includes(status) && <Button size="sm" color="warning" isLoading={submit.isPending} onPress={() => submit.mutate({ entityType: row.entityType, id: row._id })}>Submit</Button>}{!locked && <Button size="sm" color="danger" variant="flat" isLoading={remove.isPending} onPress={() => remove.mutate({ entityType: row.entityType, id: row._id, name: row.name })}>Delete</Button>}{locked && <Chip size="sm" color="success">Locked after approval</Chip>}</div></div>
        </article>;
      })}
    </section>
  </DashboardPage>;
}
