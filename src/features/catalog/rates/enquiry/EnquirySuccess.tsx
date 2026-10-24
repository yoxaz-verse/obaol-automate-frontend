import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle, FiList, FiX } from "react-icons/fi";

export const EnquirySuccess = ({ product, live, canOpen, open, list, close }: { product: string; live: boolean; canOpen: boolean; open: () => void; list: () => void; close: () => void }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-5 py-8 text-center">
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-success-500/20 bg-success-500/10 text-success-500 shadow-lg shadow-success-500/20"><FiCheckCircle size={50} /></div>
    <div><h3 className="text-2xl font-black tracking-tight">Enquiry Created</h3><p className="max-w-[360px] text-sm leading-relaxed text-default-500">{live ? `Your enquiry for ${product} was created successfully. Continue to enquiry details to proceed with responses, negotiation, and execution.` : `Your enquiry for ${product} was created successfully. The seller has been asked to confirm the latest price and product availability.`}</p></div>
    <div className="w-full max-w-[420px] rounded-2xl border border-primary-300/35 bg-primary-500/10 px-4 py-3 text-left"><p className="text-[11px] font-black uppercase tracking-widest text-primary-600">Next Step</p><p className="mt-1 text-sm">Open enquiry details now to continue the transaction flow.</p></div>
    <div className="flex w-full max-w-[420px] flex-col gap-2.5">
      <Button color="primary" size="lg" className="rounded-2xl font-black" isDisabled={!canOpen} onPress={open} endContent={<FiArrowRight size={16} />}>Open Enquiry Details</Button>
      <Button variant="flat" size="lg" className="rounded-2xl font-semibold" onPress={list} startContent={<FiList size={16} />}>Go to Enquiries</Button>
      <Button variant="light" size="sm" onPress={close} startContent={<FiX size={14} />}>Close</Button>
    </div>
  </motion.div>
);
