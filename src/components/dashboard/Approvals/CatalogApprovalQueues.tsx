"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Chip, Select, SelectItem, Textarea } from "@nextui-org/react";
import { getData, patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

const TYPES = [
  ["category", "Categories"], ["subCategory", "Subcategories"], ["product", "Products"],
  ["productVariant", "Variants"],
] as const;

const rowTitle = (row: any) => row?.name || row?.proposedChanges?.name || (row?.sourceKind === "REVISION" ? "Pending revision" : `Listing ${String(row?._id || "").slice(-6)}`);

export default function CatalogApprovalQueues() {
  const queryClient = useQueryClient();
  const [entityType, setEntityType] = useState<string>("category");
  const [status, setStatus] = useState("PENDING_REVIEW");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const query = useQuery({
    queryKey: ["catalog-approvals", entityType, status],
    queryFn: async () => (await getData(apiRoutes.approvals.catalogList(entityType), { status, limit: 100 }))?.data?.data || [],
  });
  const review = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "APPROVE" | "REJECT" }) => patchData(
      apiRoutes.approvals.catalogAction(entityType, id), { action, notes: String(notes[id] || "").trim() },
    ),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Catalog approval updated." });
      queryClient.invalidateQueries({ queryKey: ["catalog-approvals"] });
    },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Could not update approval." }),
  });
  const rows = Array.isArray(query.data) ? query.data : [];
  return (
    <section className="rounded-2xl border border-default-200 bg-content1 p-5 space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div><h2 className="text-lg font-bold">Commodity directory approvals</h2><p className="text-xs text-default-500">Review Associate-proposed categories, products, and variants. Trade listings publish immediately.</p></div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select label="Queue" selectedKeys={[entityType]} onSelectionChange={(keys) => setEntityType(String(Array.from(keys)[0] || "category"))} className="w-full sm:w-52">
            {TYPES.map(([key, label]) => <SelectItem key={key}>{label}</SelectItem>)}
          </Select>
          <Select label="Status" selectedKeys={[status]} onSelectionChange={(keys) => setStatus(String(Array.from(keys)[0] || "PENDING_REVIEW"))} className="w-full sm:w-48">
            {['PENDING_REVIEW', 'APPROVED', 'REJECTED'].map((key) => <SelectItem key={key}>{key.replaceAll('_', ' ')}</SelectItem>)}
          </Select>
        </div>
      </div>
      {query.isLoading ? <p className="text-sm text-default-500">Loading approvals…</p> : rows.length === 0 ? <p className="rounded-xl bg-default-50 p-6 text-center text-sm text-default-500">No items in this queue.</p> : (
        <div className="space-y-3">{rows.map((row: any) => (
          <article key={row._id} className="rounded-xl border border-default-200 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold truncate">{rowTitle(row)}</h3><Chip size="sm" color={row.sourceKind === "REVISION" ? "secondary" : "warning"} variant="flat">{row.sourceKind === "REVISION" ? "Revision" : "New"}</Chip></div>
                <p className="mt-1 text-xs text-default-500">Submitted by {row?.createdByAssociate?.name || "Associate"} · {row?.createdByCompany?.name || "Company"}</p>
                {row.description && <p className="mt-2 text-sm text-default-600">{row.description}</p>}
                {row.proposedChanges && <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-default-50 p-3 text-xs">{JSON.stringify(row.proposedChanges, null, 2)}</pre>}
                {row.reviewNotes && <p className="mt-2 text-xs text-danger">Review note: {row.reviewNotes}</p>}
              </div>
              {status === "PENDING_REVIEW" && <div className="w-full md:w-80 space-y-2">
                <Textarea size="sm" label="Review notes" value={notes[row._id] || ""} onValueChange={(value) => setNotes((prev) => ({ ...prev, [row._id]: value }))} />
                <div className="flex justify-end gap-2"><Button size="sm" color="danger" variant="flat" isDisabled={!String(notes[row._id] || '').trim()} isLoading={review.isPending} onPress={() => review.mutate({ id: row._id, action: "REJECT" })}>Return</Button><Button size="sm" color="success" isLoading={review.isPending} onPress={() => review.mutate({ id: row._id, action: "APPROVE" })}>Approve</Button></div>
              </div>}
            </div>
          </article>
        ))}</div>
      )}
    </section>
  );
}
