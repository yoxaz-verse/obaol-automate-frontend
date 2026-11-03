"use client";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FiInfo, FiMessageSquare } from "react-icons/fi";
import { LuMessageSquare } from "react-icons/lu";
import { showToastMessage } from "@/utils/utils";
import { isValidObjectId } from "../domain";
import { LISTING_ACTION_CLASS } from "../constants";
import type { EnquiryRate } from "./domain";
import { useCreateEnquiry } from "./useCreateEnquiry";
import { EnquiryFields } from "./EnquiryFields";
import { EnquirySuccess } from "./EnquirySuccess";

export interface CreateEnquiryButtonProps { productVariant: string; variantRate: EnquiryRate; compact?: boolean }

export const CreateEnquiryButton = ({ variantRate, productVariant, compact = false }: CreateEnquiryButtonProps) => {
  const modal = useDisclosure();
  const warning = useDisclosure();
  const router = useRouter();
  const enquiry = useCreateEnquiry(variantRate, productVariant);
  const product = typeof variantRate.product === "string" ? variantRate.product : "Product";
  const variant = typeof variantRate.productVariant === "string" ? variantRate.productVariant : "Standard";
  const begin = () => variantRate.isLive ? modal.onOpen() : warning.onOpen();
  const navigate = (path: string, close: () => void) => { close(); router.push(path); };

  return (
    <div className={compact ? "flex w-full min-w-0 flex-col items-center gap-2" : "flex flex-col items-center gap-2"}>
      <Button size="sm" color="primary" variant="flat" className={`${LISTING_ACTION_CLASS} ${compact ? "w-full min-w-0 gap-1 px-2 text-[9px] tracking-normal" : ""}`} startContent={<LuMessageSquare size={16} />} onPress={begin}>{variantRate.isLive ? "Enquire" : "Check Current Price"}</Button>
      <Modal isOpen={warning.isOpen} onOpenChange={warning.onOpenChange} placement="center" backdrop="blur" size="md" scrollBehavior="inside" classNames={{ base: "mx-4 rounded-3xl border border-warning-300/70 shadow-2xl", header: "px-6 pb-2 pt-6 sm:px-8 sm:pt-8", body: "px-6 py-4 sm:px-8", footer: "gap-3 px-6 pb-6 pt-3 sm:px-8 sm:pb-8" }}>
        <ModalContent>{(close) => <><ModalHeader className="flex items-start gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-100 text-warning-700"><FiInfo size={22} /></span><span><span className="block text-xl font-black">This is an older listing</span><span className="block text-xs font-bold  text-warning-700">Price and stock require confirmation</span></span></ModalHeader><ModalBody><p>The displayed amount is a previous listed price and may no longer be valid.</p><div className="rounded-2xl border border-warning-200 bg-warning-50/70 p-4">The seller will confirm the current price and product availability before the enquiry moves forward.</div></ModalBody><ModalFooter className="flex-col-reverse sm:flex-row sm:justify-end"><Button variant="bordered" onPress={close}>Cancel</Button><Button color="warning" startContent={<LuMessageSquare size={16} />} onPress={() => { close(); modal.onOpen(); }}>Continue with Enquiry</Button></ModalFooter></>}</ModalContent>
      </Modal>
      <Modal placement="center" isOpen={modal.isOpen} onOpenChange={modal.onOpenChange} isDismissable={false} isKeyboardDismissDisabled size="md" backdrop="blur" className="mx-4 text-foreground">
        <ModalContent className="max-h-[90vh] overflow-hidden border border-divider bg-background">{(close) => <>
          <ModalHeader className="flex items-center gap-2.5 border-b border-divider px-5 py-3"><div className="rounded-lg bg-primary/10 p-1.5 text-primary-500"><FiMessageSquare size={16} /></div><div><h3 className="text-base font-black leading-tight">New Enquiry</h3><p className="text-[9px] font-bold tracking-widest text-default-400">Direct Manufacturer Protocol</p></div></ModalHeader>
          <ModalBody className="overflow-y-auto px-5 py-3">
            <div className="mb-3 flex items-center justify-between rounded-lg border border-divider/40 bg-default-100/50 px-3 py-2"><div className="min-w-0"><span className="block text-[9px] font-black tracking-widest text-default-400">Target Product</span><span className="block truncate text-sm font-bold">{product}</span></div><div className="ml-3 shrink-0 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary-600">{variant}</div></div>
            {enquiry.success ? <EnquirySuccess canOpen={Boolean(enquiry.createdId)} open={() => { const id = String(enquiry.createdId || ""); if (!isValidObjectId(id)) return showToastMessage({ type: "error", message: "Unable to open enquiry details. Invalid enquiry ID." }); navigate(`/dashboard/enquiries/${id}`, close); }} /> : <EnquiryFields {...enquiry} />}
          </ModalBody>
        </>}</ModalContent>
      </Modal>
    </div>
  );
};
