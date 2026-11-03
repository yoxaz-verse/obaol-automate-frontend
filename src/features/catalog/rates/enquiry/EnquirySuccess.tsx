import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

export const EnquirySuccess = ({ canOpen, open }: { canOpen: boolean; open: () => void }) => (
  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-4 text-center">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-success-500/20 bg-success-500/10 text-success-500"><FiCheckCircle size={26} /></div>
    <h3 className="text-lg font-black tracking-tight">Enquiry Created</h3>
    <Button color="primary" size="md" className="w-full rounded-xl font-bold" isDisabled={!canOpen} onPress={open} endContent={<FiArrowRight size={15} />}>Open Enquiry Details</Button>
  </motion.div>
);
