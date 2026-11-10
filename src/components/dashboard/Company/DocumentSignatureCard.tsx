"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Spinner } from "@nextui-org/react";
import { deleteData, getData, postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";

export default function DocumentSignatureCard({ endpoint, title = "Document signature", enabled = true }: { endpoint: string; title?: string; enabled?: boolean }) {
  const client = useQueryClient();
  const [file, setFile] = useState<File | null>(null), [preview, setPreview] = useState(""), [signerName, setSignerName] = useState(""), [signerDesignation, setSignerDesignation] = useState("");
  const query = useQuery({ queryKey: ["document-signature", endpoint], queryFn: async () => (await getData(endpoint)).data.data, enabled });
  useEffect(() => { if (!query.data) return; setSignerName(query.data.signerName || ""); setSignerDesignation(query.data.signerDesignation || ""); setPreview(query.data.imageDataUrl || ""); }, [query.data]);
  useEffect(() => { if (!file) return; const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  const save = useMutation({ mutationFn: async () => { const body = new FormData(); if (file) body.append("signature", file); body.append("signerName", signerName); body.append("signerDesignation", signerDesignation); return postData(endpoint, body); }, onSuccess: async () => { setFile(null); await client.invalidateQueries({ queryKey: ["document-signature", endpoint] }); showToastMessage({ type: "success", message: "Document signature saved." }); }, onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Signature could not be saved." }) });
  const remove = useMutation({ mutationFn: () => deleteData(endpoint), onSuccess: async () => { setPreview(""); setSignerName(""); setSignerDesignation(""); setFile(null); await client.invalidateQueries({ queryKey: ["document-signature", endpoint] }); }, onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Signature could not be removed." }) });
  if (!enabled) return null;
  return <section className="mt-5 rounded-xl border border-default-200 bg-content1 p-4">
    <div className="mb-4"><h3 className="text-lg font-semibold">{title}</h3><p className="text-sm text-default-500">Upload a clear PNG or JPG. A light background is removed automatically and the saved transparent signature is applied to documents issued by this company.</p></div>
    {query.isLoading ? <Spinner size="sm" /> : <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-default-300 bg-[linear-gradient(45deg,#eee_25%,transparent_25%),linear-gradient(-45deg,#eee_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eee_75%),linear-gradient(-45deg,transparent_75%,#eee_75%)] bg-[length:16px_16px]">
        {preview ? <img src={preview} alt="Signature preview" className="max-h-28 max-w-full object-contain p-3" /> : <span className="text-xs text-default-500">No signature configured</span>}
      </div>
      <div className="space-y-3"><input aria-label="Upload transparent signature" type="file" accept="image/png,image/jpeg" onChange={event => setFile(event.target.files?.[0] || null)} className="block w-full text-sm" /><div className="grid gap-3 sm:grid-cols-2"><Input label="Authorized signer name" value={signerName} onValueChange={setSignerName} isRequired /><Input label="Designation" value={signerDesignation} onValueChange={setSignerDesignation} /></div><div className="flex flex-wrap gap-2"><Button color="primary" isLoading={save.isPending} isDisabled={!signerName.trim() || (!file && !query.data?.imageDataUrl)} onPress={() => save.mutate()}>Confirm and save</Button>{query.data?.imageDataUrl && <Button color="danger" variant="light" isLoading={remove.isPending} onPress={() => remove.mutate()}>Remove signature</Button>}</div></div>
    </div>}
  </section>;
}
