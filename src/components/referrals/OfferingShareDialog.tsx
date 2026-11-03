"use client";

import { useMemo, useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from "@nextui-org/react";
import { FiCopy, FiExternalLink, FiLink, FiMail, FiShare2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/core/api/apiRoutes";
import { postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";

export type ShareOfferingType = "PRODUCT" | "QUALITY_LAB" | "PACKAGING" | "FREIGHT" | "INLAND_TRANSPORT" | "WAREHOUSE";

type Props = {
  offeringType: ShareOfferingType;
  offeringId: string;
  title: string;
  description?: string;
  rate?: number | null;
  formattedRate?: string;
  unit?: string;
  buttonSize?: "sm" | "md" | "lg";
  buttonVariant?: "solid" | "flat" | "bordered" | "light";
  buttonClassName?: string;
  compact?: boolean;
};

const serviceLabels: Record<ShareOfferingType, string> = {
  PRODUCT: "product rate", QUALITY_LAB: "testing capabilities", PACKAGING: "packaging services",
  FREIGHT: "freight services", INLAND_TRANSPORT: "transport services", WAREHOUSE: "warehouse services",
};

export function OfferingShareDialog({ offeringType, offeringId, title, description = "", rate, formattedRate, unit, buttonSize = "sm", buttonVariant = "flat", buttonClassName = "", compact = false }: Props) {
  const [open, setOpen] = useState(false), [includeRate, setIncludeRate] = useState(false), [result, setResult] = useState<any>(null);
  const client = useQueryClient(), rateBearing = offeringType === "PRODUCT" || offeringType === "WAREHOUSE";
  const mutation = useMutation({
    mutationFn: () => postData(apiRoutes.associateReferrals.shares, { offeringType, offeringId }),
    onSuccess: async (response: any) => { const data = response?.data?.data || {}, raw = String(data.url || data.path || ""); setResult({ ...data, url: raw.startsWith("/") ? `${window.location.origin}${raw}` : raw }); await client.invalidateQueries({ queryKey: ["associate-referrals"] }); },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Share link could not be created." }),
  });
  const openDialog = () => { setOpen(true); setIncludeRate(false); if (!result) mutation.mutate(); };
  const shownRate = formattedRate || (Number.isFinite(Number(rate)) ? String(rate) : "");
  const message = useMemo(() => {
    if (!result?.url) return "";
    const detail = rateBearing
      ? `Our latest rate for ${title}${includeRate && shownRate ? ` is ${shownRate}${unit ? ` per ${unit}` : ""}` : " is now available on OBAOL"}.`
      : `${title} has published its ${serviceLabels[offeringType]} on OBAOL.${description ? ` ${description}` : ""}`;
    return `${detail} View the current details: ${result.url}`;
  }, [description, includeRate, offeringType, rateBearing, result?.url, shownRate, title, unit]);
  const copy = async (value: string, label: string) => { try { await navigator.clipboard.writeText(value); showToastMessage({ type: "success", message: `${label} copied.` }); } catch { showToastMessage({ type: "error", message: `Unable to copy ${label.toLowerCase()}.` }); } };
  const channelUrl = (channel: string) => `${result.url}${result.url.includes("?") ? "&" : "?"}channel=${channel}`;
  const share = async (channel: "LINKEDIN" | "WHATSAPP" | "EMAIL" | "NATIVE") => {
    if (!result?.url) return;
    const tracked = channelUrl(channel), channelMessage = message.replace(result.url, tracked);
    if (channel === "LINKEDIN") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(tracked)}`, "_blank", "noopener,noreferrer");
    else if (channel === "WHATSAPP") window.open(`https://wa.me/?text=${encodeURIComponent(channelMessage)}`, "_blank", "noopener,noreferrer");
    else if (channel === "EMAIL") window.location.href = `mailto:?subject=${encodeURIComponent(`Shared on OBAOL: ${title}`)}&body=${encodeURIComponent(channelMessage)}`;
    else if (navigator.share) { try { await navigator.share({ title, text: channelMessage.replace(tracked, "").trim(), url: tracked }); } catch (error: any) { if (error?.name !== "AbortError") showToastMessage({ type: "error", message: "Unable to open device sharing." }); } }
  };
  return <>
    <Button size={buttonSize} variant={buttonVariant} className={buttonClassName} startContent={<FiShare2 />} onPress={openDialog} aria-label={`Share ${title}`}>{compact ? "Share" : "Share"}</Button>
    <Modal isOpen={open} onOpenChange={setOpen} size="lg" scrollBehavior="inside"><ModalContent><ModalHeader className="flex-col items-start gap-1"><span>Share {title}</span><span className="text-xs font-normal text-default-500">This tracked link automatically carries your company referral.</span></ModalHeader><ModalBody>
      {rateBearing && shownRate && <div className="flex items-center justify-between gap-4 rounded-xl bg-default-100 p-4"><div><p className="font-bold">Include current rate</p><p className="text-xs text-default-500">Add {shownRate}{unit ? ` per ${unit}` : ""} to the message. The social preview remains rate-free.</p></div><Switch isSelected={includeRate} onValueChange={setIncludeRate} aria-label="Include current rate in shared message" /></div>}
      {mutation.isPending ? <div className="rounded-xl bg-default-100 p-5 text-sm text-default-500">Creating your tracked link…</div> : mutation.isError ? <Button color="danger" variant="flat" onPress={() => mutation.mutate()}>Try creating the link again</Button> : result?.url ? <><div className="rounded-xl border border-default-200 p-4"><p className="break-all text-xs font-semibold">{result.url}</p><p className="mt-3 whitespace-pre-wrap text-sm text-default-600">{message}</p></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3"><Button startContent={<FiExternalLink />} color="primary" onPress={() => share("LINKEDIN")}>LinkedIn</Button><Button startContent={<FaWhatsapp />} color="success" variant="flat" onPress={() => share("WHATSAPP")}>WhatsApp</Button><Button startContent={<FiMail />} variant="flat" onPress={() => share("EMAIL")}>Email</Button><Button startContent={<FiCopy />} variant="flat" onPress={() => copy(result.url, "Link")}>Copy link</Button><Button startContent={<FiCopy />} variant="flat" onPress={() => copy(message, "Message")}>Copy message</Button>{typeof navigator !== "undefined" && navigator.share && <Button startContent={<FiShare2 />} variant="flat" onPress={() => share("NATIVE")}>Share…</Button>}</div></> : null}
    </ModalBody><ModalFooter><Button variant="light" onPress={() => setOpen(false)}>Close</Button></ModalFooter></ModalContent></Modal>
  </>;
}
