"use client";

import React, { useContext, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardBody, CardHeader, Button, Chip, Input, Textarea } from "@nextui-org/react";
import Title from "@/components/titles";
import { getData, patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import AuthContext from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function ExecutionEnquiriesPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [bidMap, setBidMap] = useState<Record<string, string>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const { data: enquiryRes, isLoading } = useQuery({
    queryKey: ["execution-enquiries"],
    queryFn: () => getData(apiRoutes.enquiry.getAll, { page: 1, limit: 200, sort: "createdAt:desc" }),
  });

  const enquiries = useMemo(() => {
    const raw = enquiryRes?.data?.data;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [enquiryRes]);

  const rows = useMemo(() => {
    const userId = user?.id?.toString();
    return enquiries.flatMap((enq: any) => {
      const buyerId = (enq?.buyerAssociateId?._id || enq?.buyerAssociateId || "").toString();
      const sellerId = (enq?.sellerAssociateId?._id || enq?.sellerAssociateId || "").toString();
      const isBuyer = userId && buyerId === userId;
      const isSeller = userId && sellerId === userId;
      const isObaol = user?.role === "Admin" || user?.role === "Employee";

      return (Array.isArray(enq?.executionInquiries) ? enq.executionInquiries : []).map((task: any, idx: number) => {
        const owner = String(task?.ownerBy || "");
        const canAct =
          isObaol ||
          (owner === "buyer" && isBuyer) ||
          (owner === "seller" && isSeller);
        const productName = enq?.productId?.name || enq?.productVariant?.product?.name || "Unknown Product";
        const variantName = enq?.productVariant?.name || enq?.variantId?.name || "Unknown Variant";
        const buyerName = enq?.buyerAssociateId?.name || enq?.buyerAssociateName || "Buyer";
        const sellerName = enq?.sellerAssociateId?.name || enq?.sellerAssociateName || "Supplier";
        return {
          key: `${enq?._id}-${task?.type}-${idx}`,
          enquiryId: enq?._id,
          enquiryCode: String(enq?._id || "").slice(-6).toUpperCase(),
          anchorName: `${productName} - ${variantName}`,
          productName,
          variantName,
          buyerName,
          sellerName,
          type: task?.type,
          title: task?.title || task?.type,
          ownerBy: owner,
          status: task?.status || "OPEN",
          bidAmount: task?.bidAmount,
          commitNote: task?.commitNote,
          details: task?.details || {},
          canAct,
        };
      });
    });
  }, [enquiries, user]);

  const enquiriesWithTasks = useMemo(() => {
    const grouped: Record<string, any> = {};
    for (const row of rows) {
      const key = String(row.enquiryId || "");
      if (!grouped[key]) {
        grouped[key] = {
          enquiryId: row.enquiryId,
          enquiryCode: row.enquiryCode,
          anchorName: row.anchorName,
          productName: row.productName,
          variantName: row.variantName,
          buyerName: row.buyerName,
          sellerName: row.sellerName,
          tradeType: row.details?.tradeType || "DOMESTIC",
          from: row.details?.from || "N/A",
          to: row.details?.to || "N/A",
          tasks: [],
        };
      }
      grouped[key].tasks.push(row);
    }
    return Object.values(grouped);
  }, [rows]);

  const updateTaskMutation = useMutation({
    mutationFn: async (payload: { enquiryId: string; type: string; bidAmount?: number; commitNote?: string; status?: string }) => {
      return patchData(`${apiRoutes.enquiry.getAll}/${payload.enquiryId}/execution-inquiries/${encodeURIComponent(payload.type)}`, {
        bidAmount: payload.bidAmount,
        commitNote: payload.commitNote,
        status: payload.status,
      });
    },
    onSuccess: () => {
      toast.success("Execution inquiry updated.");
      queryClient.invalidateQueries({ queryKey: ["execution-enquiries"] });
    },
    onError: () => {
      toast.error("Failed to update execution inquiry.");
    },
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <section>
      <Title title="Execution Enquiries Panel" />
      <div className="mt-4 flex flex-col gap-5">
        {enquiriesWithTasks.map((enq: any) => (
          <Card key={enq.enquiryId} className="border border-default-200 shadow-sm">
            <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-default-400">Execution Anchor</div>
                <div className="text-base font-bold text-foreground">{enq.anchorName}</div>
                <div className="text-xs text-default-500 mt-1">Enquiry #{enq.enquiryCode}</div>
              </div>
              <div className="rounded-md bg-default-100 p-2 text-xs text-default-600 min-w-[220px]">
                <div>Trade: {enq.tradeType}</div>
                <div>From: {enq.from}</div>
                <div>To: {enq.to}</div>
                <div>Buyer: {enq.buyerName}</div>
                <div>Supplier: {enq.sellerName}</div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {enq.tasks.map((row: any) => (
                  <Card key={row.key} className="border border-default-200">
                    <CardHeader className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-semibold">{row.title}</div>
                        <div className="text-xs text-default-500">Owner: {String(row.ownerBy || "obaol").toUpperCase()}</div>
                      </div>
                      <Chip size="sm" color={row.status === "COMPLETED" ? "success" : row.status === "IN_PROGRESS" ? "warning" : "default"} variant="flat">
                        {row.status}
                      </Chip>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-3">
                      <div className="rounded-md bg-default-100 p-2 text-xs text-default-600">
                        {row.details?.routeNotes ? <div>Notes: {row.details.routeNotes}</div> : <div>No additional notes.</div>}
                      </div>
                      <Input
                        size="sm"
                        type="number"
                        label="Bid Amount"
                        value={bidMap[row.key] ?? (row.bidAmount?.toString() || "")}
                        onValueChange={(v) => setBidMap((prev) => ({ ...prev, [row.key]: v }))}
                        isDisabled={!row.canAct}
                      />
                      <Textarea
                        size="sm"
                        label="Commit Note"
                        value={noteMap[row.key] ?? (row.commitNote || "")}
                        onValueChange={(v) => setNoteMap((prev) => ({ ...prev, [row.key]: v }))}
                        isDisabled={!row.canAct}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          color="warning"
                          isDisabled={!row.canAct}
                          isLoading={updateTaskMutation.isPending}
                          onPress={() =>
                            updateTaskMutation.mutate({
                              enquiryId: row.enquiryId,
                              type: row.type,
                              bidAmount: Number(bidMap[row.key] || row.bidAmount || 0),
                              commitNote: noteMap[row.key] ?? row.commitNote,
                              status: "IN_PROGRESS",
                            })
                          }
                        >
                          Place Bid
                        </Button>
                        <Button
                          size="sm"
                          color="success"
                          isDisabled={!row.canAct}
                          isLoading={updateTaskMutation.isPending}
                          onPress={() =>
                            updateTaskMutation.mutate({
                              enquiryId: row.enquiryId,
                              type: row.type,
                              bidAmount: Number(bidMap[row.key] || row.bidAmount || 0),
                              commitNote: noteMap[row.key] ?? row.commitNote,
                              status: "COMPLETED",
                            })
                          }
                        >
                          Commit
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      {enquiriesWithTasks.length === 0 && (
        <div className="text-center text-default-500 py-16">No execution enquiries available yet.</div>
      )}
    </section>
  );
}
