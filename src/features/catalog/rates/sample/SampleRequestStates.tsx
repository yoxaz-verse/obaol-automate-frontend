import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import type { LocationOption, SampleFormState } from "./domain";

export const CooldownWarning = ({ label }: { label: string }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3">
    <FiX className="mt-0.5 shrink-0 text-danger-400" size={18} />
    <div className="text-[11px] font-semibold leading-relaxed text-danger-300">{label} Please wait before creating another sample request for the same buyer.</div>
  </div>
);

export const SampleConfirmation = ({ form, states, districts, includeBuyer }: { form: SampleFormState; states: LocationOption[]; districts: LocationOption[]; includeBuyer: boolean }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
    <div className="rounded-[2rem] border border-obaol-500/10 bg-obaol-500/5 p-6">
      <div className="mb-4 flex items-center gap-3"><FiInfo size={18} className="text-obaol-500" /><h4 className="text-sm font-black uppercase tracking-widest">Protocol Review</h4></div>
      <div className="space-y-4 text-sm">
        {includeBuyer && <ReviewRow label="Authorized Associate" value={form.buyerAssociateName || "Not Identified"} />}
        <ReviewRow label="State" value={states.find((item) => item._id === form.state)?.name || "N/A"} />
        <ReviewRow label="District" value={districts.find((item) => item._id === form.district)?.name || "N/A"} />
        <ReviewRow label="Quantity" value={`${form.quantityKg} KG`} accent />
        <div><span className="text-[10px] font-black uppercase tracking-widest text-default-400">Dispatch Point</span><p className="mt-1 text-xs italic text-default-600">{form.address}, {form.pincode}</p></div>
      </div>
    </div>
    <div className="flex items-start gap-4 rounded-[1.5rem] border border-primary/10 bg-primary/5 p-4">
      <FiCheckCircle className="mt-0.5 shrink-0 text-primary" size={18} />
      <p className="text-[11px] font-semibold leading-relaxed text-default-600">Authorized officers will process this request for immediate preparation. Once initiated, the protocol cannot be cancelled from Trade Listings.</p>
    </div>
  </motion.div>
);

const ReviewRow = ({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex items-center justify-between border-b border-divider/30 py-2">
    <span className="text-[10px] font-black uppercase tracking-widest text-default-400">{label}</span>
    <span className={accent ? "font-black text-obaol-500" : "font-bold"}>{value}</span>
  </div>
);

export const SampleSuccess = ({ close, navigate }: { close: () => void; navigate: () => void }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center gap-8 py-12 text-center">
    <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-success-500 to-emerald-600 shadow-[0_15px_40px_rgba(16,185,129,0.3)]"><FiCheckCircle className="text-4xl text-white" /></div>
    <div><h3 className="text-3xl font-black uppercase italic tracking-tighter">Protocol Initiated</h3><p className="mt-3 text-[10px] font-black uppercase tracking-[0.4em] text-success-500">Tactical Dispatch Sent</p></div>
    <p className="max-w-[280px] text-xs font-bold uppercase leading-relaxed text-default-500">Your sample request has been successfully submitted to the supplier for preparation.</p>
    <div className="flex w-full flex-col gap-3">
      <Button fullWidth variant="light" className="h-14 font-black uppercase tracking-[0.2em] text-success-500" onPress={close}>Acknowledge Protocol</Button>
      <Button fullWidth variant="light" className="h-14 font-black uppercase tracking-[0.2em] text-default-500" onPress={navigate}>Navigate to Hub</Button>
    </div>
  </motion.div>
);
