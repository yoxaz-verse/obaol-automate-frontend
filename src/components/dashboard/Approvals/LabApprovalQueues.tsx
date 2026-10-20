"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, Checkbox, Chip, Textarea } from "@nextui-org/react";
import { useState } from "react";
import { FiAlertCircle, FiCheck, FiExternalLink, FiX } from "react-icons/fi";
import { LuFlaskConical } from "react-icons/lu";
import { getData, patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import type { LabProfile } from "@/types/labProfile";
import { optionName } from "@/types/labProfile";

export default function LabApprovalQueues() {
  const client = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [verifiedCredentials, setVerifiedCredentials] = useState<Record<string, string[]>>({});
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});
  const labsQuery = useQuery({ queryKey: ["lab-approvals"], queryFn: async () => (await getData(apiRoutes.labProfiles.approvals, { status: "PENDING_REVIEW" })).data.data as LabProfile[] });
  const taxonomyQuery = useQuery({ queryKey: ["lab-taxonomy-requests"], queryFn: async () => (await getData(apiRoutes.labProfiles.taxonomyAdmin, { status: "REQUESTED" })).data.data as any[] });
  const review = useMutation({
    mutationFn: ({ id, action, note }: any) => patchData(`${apiRoutes.labProfiles.approvals}/${id}`, { action, notes: note, expectedRevision: (labsQuery.data || []).find((lab) => lab._id === id)?.revision, verifiedCredentialIds: verifiedCredentials[id] || [] }),
    onMutate: ({ id }: any) => setReviewErrors((current) => { const next = { ...current }; delete next[id]; return next; }),
    onSuccess: (_response, variables: any) => {
      client.invalidateQueries({ queryKey: ["lab-approvals"] });
      setReviewErrors((current) => { const next = { ...current }; delete next[variables.id]; return next; });
      showToastMessage({ type: "success", message: variables.action === "APPROVE" ? "Profile published." : "Profile rejected." });
    },
    onError: (error: any, variables: any) => {
      const message = error?.response?.data?.message || "Unable to update this lab review. Please try again.";
      setReviewErrors((current) => ({ ...current, [variables.id]: message }));
      showToastMessage({ type: "error", message: "The review could not be completed. See the profile for details." });
    },
  });
  const reviewTaxonomy = useMutation({ mutationFn: ({ id, action }: any) => patchData(`${apiRoutes.labProfiles.taxonomyAdmin}/${id}`, { action }), onSuccess: () => client.invalidateQueries({ queryKey: ["lab-taxonomy-requests"] }) });
  const labs = labsQuery.data || [];
  const requests = taxonomyQuery.data || [];
  if (labsQuery.isLoading || taxonomyQuery.isLoading) return <div className="p-10 text-center text-default-500">Loading lab approvals…</div>;
  if (!labs.length && !requests.length) return <div className="rounded-2xl border border-dashed border-default-300 p-12 text-center text-default-500">No lab profiles or taxonomy requests are awaiting review.</div>;
  return <div className="space-y-4"><div className="flex items-center gap-2"><LuFlaskConical className="text-success-500" /><h2 className="text-lg font-black">Lab capability approvals</h2><Chip size="sm" color="warning">{labs.length + requests.length} pending</Chip></div>
    {requests.length ? <Card className="border border-warning-500/20"><CardBody className="gap-3"><b>Requested filter options</b>{requests.map((item) => <div key={item._id} className="flex items-center justify-between rounded-xl bg-default-100 p-3"><span><Chip size="sm">{item.kind}</Chip> <b>{item.name}</b></span><span className="flex gap-1"><Button isIconOnly size="sm" color="success" onPress={() => reviewTaxonomy.mutate({ id: item._id, action: "APPROVE" })}><FiCheck /></Button><Button isIconOnly size="sm" color="danger" variant="flat" onPress={() => reviewTaxonomy.mutate({ id: item._id, action: "REJECT" })}><FiX /></Button></span></div>)}</CardBody></Card> : null}
    {labs.map((lab) => { const draft = lab.draft!; const old = lab.published; const isReviewing = review.isPending && review.variables?.id === lab._id; return <Card key={lab._id} className="border border-warning-500/20"><CardBody className="gap-4 p-5"><div className="flex justify-between"><div><h3 className="text-lg font-black">{draft.displayName}</h3><p className="text-sm text-default-500">{lab.companyId?.name} · {old ? "Revision" : "New profile"}</p></div><Chip color="warning">Pending review</Chip></div><div className="grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-default-100 p-3"><small>Product capabilities</small><b className="block text-xl">{draft.productCapabilityTemplates.length}</b>{old ? <small>Previously {old.productCapabilityTemplates.length}</small> : null}</div><div className="rounded-xl bg-default-100 p-3"><small>Export countries</small><b className="block text-xl">{draft.countryAssignments.length}</b>{old ? <small>Previously {old.countryAssignments.length}</small> : null}</div><div className="rounded-xl bg-default-100 p-3"><small>Credentials</small><b className="block text-xl">{draft.credentials.length}</b></div></div><div className="space-y-2">{draft.credentials.map((credential, index) => { const credentialId = credential._id || String(index); const hasEvidence = Boolean(credential.documentUrl); return <div key={credentialId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-default-200 p-3"><span><b>{optionName(credential.accreditationId)}</b> · {credential.issuer}{credential.credentialNumber ? ` · ${credential.credentialNumber}` : ""}</span><span className="flex items-center gap-3">{hasEvidence ? <Button as="a" href={credential.documentUrl} target="_blank" size="sm" variant="flat" endContent={<FiExternalLink />}>Evidence</Button> : <Chip size="sm" variant="flat">No supporting document</Chip>}<Checkbox isDisabled={!hasEvidence} isSelected={(verifiedCredentials[lab._id] || []).includes(credentialId)} onValueChange={(selected) => setVerifiedCredentials((current) => ({ ...current, [lab._id]: selected ? [...(current[lab._id] || []), credentialId] : (current[lab._id] || []).filter((id) => id !== credentialId) }))}>Mark verified</Checkbox></span></div>; })}</div>{reviewErrors[lab._id] ? <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700"><FiAlertCircle className="mt-0.5 shrink-0 text-lg" /><div><b>Unable to complete this review</b><p className="mt-1 leading-5">{reviewErrors[lab._id]}</p></div></div> : null}<Textarea label="Review notes / rejection reason" value={notes[lab._id] || ""} onValueChange={(value) => setNotes((current) => ({ ...current, [lab._id]: value }))} /><div className="flex justify-end gap-2"><Button color="danger" variant="flat" isDisabled={isReviewing} isLoading={isReviewing && review.variables?.action === "REJECT"} onPress={() => review.mutate({ id: lab._id, action: "REJECT", note: notes[lab._id] })}>Reject</Button><Button color="success" isDisabled={isReviewing} isLoading={isReviewing && review.variables?.action === "APPROVE"} onPress={() => review.mutate({ id: lab._id, action: "APPROVE", note: notes[lab._id] })}>Publish profile</Button></div></CardBody></Card>; })}
  </div>;
}
