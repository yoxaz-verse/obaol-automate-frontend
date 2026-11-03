"use client";

import { useMemo, useState } from "react";
import { Button, Chip, Input, Select, SelectItem, Spinner, Textarea } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Title from "@/components/titles";
import { getScenarioPreviewPath, getScenarioStoryPath, scenarioRoleOptions } from "@/data/scenarioRoles";
import { getData, postData, putData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import type { RealLifeScenario, ScenarioBlock, ScenarioBlockType } from "@/types/realLifeScenario";
import { showToastMessage } from "@/utils/utils";
import { FiArrowDown, FiArrowUp, FiEye, FiPlus, FiSave, FiSend, FiTrash2 } from "react-icons/fi";

type Draft = Omit<Partial<RealLifeScenario>, "blocks" | "faqs" | "supportingKeywords"> & {
  blocks: ScenarioBlock[]; faqs: Array<{ question: string; answer: string }>; supportingKeywords: string[];
};

const emptyDraft = (): Draft => ({
  internalTitle: "", h1: "", roleSlug: "traders", slug: "", excerpt: "", scenarioType: "REPRESENTATIVE",
  disclosureAccepted: false, blocks: [{ type: "paragraph", text: "" }], primaryKeyword: "", supportingKeywords: [],
  audienceIntent: "", seoTitle: "", seoDescription: "", heroImageUrl: "", heroImageAlt: "", faqs: [],
  cta: { label: "", href: "" }, displayOrder: 0, status: "DRAFT",
});

const blockTypes: Array<{ value: ScenarioBlockType; label: string }> = [
  ["heading", "Heading"], ["paragraph", "Paragraph"], ["ordered-list", "Numbered list"], ["unordered-list", "Bullet list"],
  ["quote", "Quote"], ["callout", "Callout"], ["image", "Image"], ["workflow", "Workflow steps"],
  ["result", "Result summary"], ["faq", "FAQ callout"], ["cta", "CTA"],
].map(([value, label]) => ({ value: value as ScenarioBlockType, label }));
const roleFilterOptions = [{ slug: "all", displayName: "All roles" }, ...scenarioRoleOptions];
const statusFilterOptions = ["all", "DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"];

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const responseMessage = (error: any) => error?.response?.data?.message || "The request could not be completed.";

export default function RealLifeScenariosAdminPage() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");

  const scenariosQuery = useQuery({
    queryKey: ["real-life-scenarios-admin"],
    queryFn: async () => (await getData(apiRoutes.realLifeScenarios.admin, {}, { cacheMode: "bypass" })).data as { data: RealLifeScenario[]; counts: Array<{ _id: string; total: number; published: number }> },
  });
  const rows = useMemo(() => scenariosQuery.data?.data || [], [scenariosQuery.data?.data]);
  const filtered = useMemo(() => rows.filter((row) => (roleFilter === "all" || row.roleSlug === roleFilter) && (statusFilter === "all" || row.status === statusFilter) && (!query || `${row.internalTitle} ${row.h1} ${row.primaryKeyword}`.toLowerCase().includes(query.toLowerCase()))), [rows, roleFilter, statusFilter, query]);
  const countMap = new Map((scenariosQuery.data?.counts || []).map((row) => [row._id, row]));

  const saveMutation = useMutation({
    mutationFn: async () => editingId ? putData(apiRoutes.realLifeScenarios.update(editingId), draft) : postData(apiRoutes.realLifeScenarios.admin, draft),
    onSuccess: (response) => { queryClient.invalidateQueries({ queryKey: ["real-life-scenarios-admin"] }); const saved = response.data?.data as RealLifeScenario; setEditingId(saved._id); setDraft(saved); showToastMessage({ type: "success", message: "Scenario draft saved." }); },
    onError: (error) => showToastMessage({ type: "error", message: responseMessage(error) }),
  });
  const transitionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => postData(apiRoutes.realLifeScenarios.transition(id), { action, scheduledAt: scheduleAt || undefined }),
    onSuccess: (response) => { queryClient.invalidateQueries({ queryKey: ["real-life-scenarios-admin"] }); setDraft(response.data.data); showToastMessage({ type: "success", message: "Publication status updated." }); },
    onError: (error: any) => showToastMessage({ type: "error", message: `${responseMessage(error)} ${(error?.response?.data?.errors || []).join(" · ")}`.trim() }),
  });

  const edit = (row: RealLifeScenario) => { setEditingId(row._id); setDraft({ ...row, blocks: row.blocks || [], faqs: row.faqs || [], supportingKeywords: row.supportingKeywords || [] }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const setField = (key: keyof Draft, value: any) => setDraft((current) => ({ ...current, [key]: value }));
  const updateBlock = (index: number, patch: Partial<ScenarioBlock>) => setDraft((current) => ({ ...current, blocks: current.blocks.map((block, i) => i === index ? { ...block, ...patch } : block) }));
  const moveBlock = (index: number, direction: -1 | 1) => setDraft((current) => { const blocks = [...current.blocks]; const target = index + direction; if (target < 0 || target >= blocks.length) return current; [blocks[index], blocks[target]] = [blocks[target], blocks[index]]; return { ...current, blocks }; });
  const warnings = [!draft.primaryKeyword && "Add a primary keyword", !draft.excerpt && "Add a card excerpt", draft.heroImageUrl && !draft.heroImageAlt && "Add image alt text", !draft.faqs.length && "Consider adding an FAQ", !draft.cta?.label && "Add a CTA"].filter(Boolean) as string[];

  const openPreview = async () => {
    if (!editingId) return showToastMessage({ type: "warning", message: "Save the draft before previewing it." });
    try { const response = await postData(apiRoutes.realLifeScenarios.previewToken(editingId), {}); const token = response.data.data.token; window.open(`${getScenarioPreviewPath(draft.roleSlug || "traders", editingId)}?token=${encodeURIComponent(token)}`, "_blank", "noopener,noreferrer"); }
    catch (error) { showToastMessage({ type: "error", message: responseMessage(error) }); }
  };

  return <div className="space-y-6 p-4 md:p-6">
    <Title title="Real-Life Scenarios" visuallyHidden />
    <header><h1 className="text-3xl font-black">Real-Life Scenarios</h1><p className="mt-2 text-sm text-default-500">Create structured, crawlable industry stories for every supported role.</p></header>

    <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">{scenarioRoleOptions.map((role) => { const count = countMap.get(role.slug); return <button key={role.slug} onClick={() => setRoleFilter(role.slug)} className="rounded-2xl border border-default-200 bg-content1 p-3 text-left hover:border-primary"><span className="block text-sm font-bold">{role.displayName}</span><span className="mt-1 block text-xs text-default-500">{count?.total || 0} created · {count?.published || 0} live</span></button>; })}</section>

    <section className="rounded-3xl border border-default-200 bg-content1 p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">{editingId ? "Edit scenario" : "New scenario"}</h2><p className="text-xs text-default-500">All saved content remains a draft until explicitly published.</p></div><Button variant="flat" onPress={() => { setEditingId(null); setDraft(emptyDraft()); }}>New draft</Button></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Select label="Role" selectedKeys={[draft.roleSlug || "traders"]} onSelectionChange={(keys) => setField("roleSlug", Array.from(keys)[0])}>{scenarioRoleOptions.map((role) => <SelectItem key={role.slug}>{role.displayName}</SelectItem>)}</Select>
        <Input label="Internal title" value={draft.internalTitle || ""} onValueChange={(value) => setField("internalTitle", value)} />
        <Input label="Public H1" value={draft.h1 || ""} onValueChange={(value) => { setField("h1", value); if (!editingId && !draft.slug) setField("slug", slugify(value)); }} />
        <Input label="URL slug" value={draft.slug || ""} onValueChange={(value) => setField("slug", slugify(value))} />
        <Textarea className="md:col-span-2" label="Card excerpt / answer-first summary" value={draft.excerpt || ""} onValueChange={(value) => setField("excerpt", value)} />
        <Input label="Primary keyword" value={draft.primaryKeyword || ""} onValueChange={(value) => setField("primaryKeyword", value)} />
        <Input label="Supporting keywords (comma-separated)" value={draft.supportingKeywords.join(", ")} onValueChange={(value) => setField("supportingKeywords", value.split(",").map((item) => item.trim()).filter(Boolean))} />
        <Textarea className="md:col-span-2" label="Audience / search intent" value={draft.audienceIntent || ""} onValueChange={(value) => setField("audienceIntent", value)} />
      </div>

      <div className="mt-8 flex items-center justify-between"><h3 className="text-lg font-black">Structured story blocks</h3><Button size="sm" startContent={<FiPlus />} onPress={() => setField("blocks", [...draft.blocks, { type: "paragraph", text: "" }])}>Add block</Button></div>
      <div className="mt-4 space-y-4">{draft.blocks.map((block, index) => <div key={index} className="rounded-2xl border border-default-200 p-4">
        <div className="flex flex-wrap items-center gap-2"><Select size="sm" className="max-w-52" aria-label="Block type" selectedKeys={[block.type]} onSelectionChange={(keys) => updateBlock(index, { type: Array.from(keys)[0] as ScenarioBlockType })}>{blockTypes.map((option) => <SelectItem key={option.value}>{option.label}</SelectItem>)}</Select><Button isIconOnly size="sm" variant="light" aria-label="Move up" onPress={() => moveBlock(index, -1)}><FiArrowUp /></Button><Button isIconOnly size="sm" variant="light" aria-label="Move down" onPress={() => moveBlock(index, 1)}><FiArrowDown /></Button><Button isIconOnly size="sm" color="danger" variant="light" aria-label="Remove block" onPress={() => setField("blocks", draft.blocks.filter((_, i) => i !== index))}><FiTrash2 /></Button></div>
        {block.type === "heading" && <Select className="mt-3 max-w-36" size="sm" label="Heading level" selectedKeys={[String(block.level || 2)]} onSelectionChange={(keys) => updateBlock(index, { level: Number(Array.from(keys)[0]) as 2 | 3 | 4 })}><SelectItem key="2">H2</SelectItem><SelectItem key="3">H3</SelectItem><SelectItem key="4">H4</SelectItem></Select>}
        {["callout", "result", "faq", "cta"].includes(block.type) && <Input className="mt-3" label="Block title" value={block.title || ""} onValueChange={(value) => updateBlock(index, { title: value })} />}
        {["ordered-list", "unordered-list", "workflow"].includes(block.type) ? <Textarea className="mt-3" label="Items (one per line)" value={(block.items || []).join("\n")} onValueChange={(value) => updateBlock(index, { items: value.split("\n").filter(Boolean) })} /> : <Textarea className="mt-3" label={block.type === "heading" ? "Heading text" : "Content"} value={block.text || ""} onValueChange={(value) => updateBlock(index, { text: value })} />}
        {block.type === "image" && <div className="mt-3 grid gap-3 md:grid-cols-2"><Input label="Image URL" value={block.imageUrl || ""} onValueChange={(value) => updateBlock(index, { imageUrl: value })} /><Input label="Image alt text" value={block.imageAlt || ""} onValueChange={(value) => updateBlock(index, { imageAlt: value })} /></div>}
        {block.type === "cta" && <Input className="mt-3" label="CTA URL" value={block.href || ""} onValueChange={(value) => updateBlock(index, { href: value })} />}
      </div>)}</div>

      <div className="mt-8 grid gap-4 md:grid-cols-2"><Input label="SEO title" description={`${(draft.seoTitle || "").length}/60 recommended`} value={draft.seoTitle || ""} onValueChange={(value) => setField("seoTitle", value)} /><Textarea label="Meta description" description={`${(draft.seoDescription || "").length}/160 recommended`} value={draft.seoDescription || ""} onValueChange={(value) => setField("seoDescription", value)} /><Input label="Hero/social image URL (optional)" value={draft.heroImageUrl || ""} onValueChange={(value) => setField("heroImageUrl", value)} /><Input label="Hero image alt text" value={draft.heroImageAlt || ""} onValueChange={(value) => setField("heroImageAlt", value)} /><Input label="CTA label" value={draft.cta?.label || ""} onValueChange={(value) => setField("cta", { ...draft.cta, label: value })} /><Input label="CTA URL" value={draft.cta?.href || ""} onValueChange={(value) => setField("cta", { ...draft.cta, href: value })} /><Input type="number" min={0} label="Display order" value={String(draft.displayOrder || 0)} onValueChange={(value) => setField("displayOrder", Math.max(0, Number(value) || 0))} /></div>
      <Textarea className="mt-4" label="FAQs (one per line: Question | Answer)" value={draft.faqs.map((faq) => `${faq.question} | ${faq.answer}`).join("\n")} onValueChange={(value) => setField("faqs", value.split("\n").map((line) => { const [question, ...answer] = line.split("|"); return { question: question?.trim(), answer: answer.join("|").trim() }; }).filter((faq) => faq.question && faq.answer))} />
      <div className="mt-5 rounded-2xl border border-default-200 p-4"><p className="text-xs font-bold uppercase tracking-wider text-default-500">Search preview</p><p className="mt-2 text-lg text-blue-600">{draft.seoTitle || draft.h1 || "Scenario title"}</p><p className="text-sm text-emerald-700">obaol.com{getScenarioStoryPath(draft.roleSlug || "traders", draft.slug || "story-slug")}</p><p className="mt-1 text-sm text-default-600">{draft.seoDescription || "Add a concise, factual description."}</p></div>
      {warnings.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{warnings.map((warning) => <Chip key={warning} color="warning" variant="flat">{warning}</Chip>)}</div>}
      <label className="mt-5 flex items-start gap-3 rounded-2xl bg-default-100 p-4 text-sm"><input type="checkbox" className="mt-1" checked={Boolean(draft.disclosureAccepted)} onChange={(event) => setField("disclosureAccepted", event.target.checked)} /><span>I confirm this is a representative educational scenario, not a customer testimonial, verified case study, guarantee, or unsupported performance claim.</span></label>
      <div className="mt-6 flex flex-wrap gap-3"><Button color="primary" startContent={<FiSave />} isLoading={saveMutation.isPending} onPress={() => saveMutation.mutate()}>Save draft</Button><Button variant="flat" startContent={<FiEye />} onPress={openPreview}>Preview</Button>{editingId && <><Button color="success" startContent={<FiSend />} onPress={() => transitionMutation.mutate({ id: editingId, action: "PUBLISH" })}>Publish</Button><Input type="datetime-local" className="max-w-64" value={scheduleAt} onValueChange={setScheduleAt} /><Button variant="bordered" onPress={() => transitionMutation.mutate({ id: editingId, action: "SCHEDULE" })}>Schedule</Button>{draft.status === "PUBLISHED" && <Button variant="bordered" onPress={() => transitionMutation.mutate({ id: editingId, action: "UNPUBLISH" })}>Unpublish</Button>}<Button color="danger" variant="light" onPress={() => transitionMutation.mutate({ id: editingId, action: "ARCHIVE" })}>Archive</Button></>}</div>
    </section>

    <section className="rounded-3xl border border-default-200 bg-content1 p-5"><div className="grid gap-3 md:grid-cols-3"><Input label="Search" value={query} onValueChange={setQuery} /><Select label="Role" selectedKeys={[roleFilter]} onSelectionChange={(keys) => setRoleFilter(String(Array.from(keys)[0]))}>{roleFilterOptions.map((role) => <SelectItem key={role.slug}>{role.displayName}</SelectItem>)}</Select><Select label="Status" selectedKeys={[statusFilter]} onSelectionChange={(keys) => setStatusFilter(String(Array.from(keys)[0]))}>{statusFilterOptions.map((status) => <SelectItem key={status}>{status === "all" ? "All statuses" : status}</SelectItem>)}</Select></div>
      {scenariosQuery.isLoading ? <div className="grid place-items-center py-16"><Spinner /></div> : <div className="mt-5 grid gap-3 lg:grid-cols-2">{filtered.map((row) => <button key={row._id} onClick={() => edit(row)} className="rounded-2xl border border-default-200 p-4 text-left hover:border-primary"><div className="flex items-start justify-between gap-3"><div><strong>{row.internalTitle}</strong><p className="mt-1 text-xs text-default-500">{row.roleSlug} · /{row.slug}</p></div><Chip size="sm" color={row.status === "PUBLISHED" ? "success" : row.status === "SCHEDULED" ? "warning" : "default"}>{row.status}</Chip></div><p className="mt-3 line-clamp-2 text-sm text-default-600">{row.excerpt}</p></button>)}</div>}
    </section>
  </div>;
}
