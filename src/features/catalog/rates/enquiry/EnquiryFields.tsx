import { Button, Card, CardBody } from "@nextui-org/react";
import { FiMessageSquare } from "react-icons/fi";
import { buyerLabel, type BuyerOption, type EnquiryFormState, type IncotermOption } from "./domain";
import AppCombobox from "@/components/ui/AppCombobox";

interface Props {
  form: EnquiryFormState; buyers: BuyerOption[]; incoterms: IncotermOption[];
  representsBuyer: boolean; buyerOptionsLoading: boolean; loading: boolean;
  disclosure: { message: string } | null;
  update: <K extends keyof EnquiryFormState>(key: K, value: EnquiryFormState[K]) => void;
  selectBuyer: (id: string) => void; submit: () => void;
}
const inputClass = "h-8 w-full rounded-lg border border-default-300 bg-default-50 px-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";

export const EnquiryFields = ({ form, buyers, incoterms, representsBuyer, buyerOptionsLoading, loading, disclosure, update, selectBuyer, submit }: Props) => (
  <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="flex flex-col gap-3">
    <Card className="border border-default-200 bg-content1 shadow-none"><CardBody className="p-3">
      <div className="grid grid-cols-1 gap-x-3 gap-y-2.5 md:grid-cols-2">
        {representsBuyer && <div>
          <AppCombobox label="Buyer associate" value={form.buyerAssociateId || null} onChange={value => selectBuyer(value || "")} options={buyers.map(buyer => ({ key: buyer._id, label: buyerLabel(buyer) }))} required disabled={buyerOptionsLoading} loading={buyerOptionsLoading} />
          {!buyerOptionsLoading && buyers.length === 0 && <p className="text-[11px] text-default-500">No active buyer associates available.</p>}
        </div>}
        <Field label="Full Name"><input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" /></Field>
        <Field label="Phone Number"><input className={inputClass} type="tel" value={form.phoneNumber} onChange={(event) => update("phoneNumber", event.target.value)} autoComplete="tel" /></Field>
        <Field label="Quantity (Ton)"><input className={inputClass} type="number" min={1} value={form.quantity} onChange={(event) => update("quantity", event.target.value)} required /></Field>
        <AppCombobox label="Preferred incoterm" value={form.preferredIncotermId || null} onChange={value => update("preferredIncotermId", value || "")} disabled={incoterms.length === 0} options={incoterms.map(item => ({ key: item._id, label: `${item.code || "NA"} - ${item.name || "Incoterm"}` }))} />
      </div>
      <div className="mt-2.5 flex flex-col gap-1">
        <label className="text-xs font-semibold text-default-600">Specification (Optional)</label>
        <textarea className={`min-h-[56px] w-full resize-y rounded-lg border bg-default-50 px-2.5 py-1.5 text-sm text-foreground outline-none ${disclosure ? "border-danger" : "border-default-300 focus:border-primary"}`} value={form.specification} onChange={(event) => update("specification", event.target.value)} aria-invalid={Boolean(disclosure)} aria-describedby={disclosure ? "enquiry-specification-error" : undefined} />
        {disclosure && <p id="enquiry-specification-error" role="alert" className="text-xs text-danger">{disclosure.message}</p>}
      </div>
    </CardBody></Card>
    <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-default-500">1 Ton = 1,000 KG</span><Button type="submit" isLoading={loading} isDisabled={loading || Boolean(disclosure)} color="primary" size="sm" className="min-w-[160px] rounded-lg font-semibold" startContent={!loading && <FiMessageSquare size={14} />}>{loading ? "Submitting..." : "Create Enquiry"}</Button></div>
  </form>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="flex flex-col gap-1"><label className="text-xs font-semibold text-default-600">{label}</label>{children}</div>;
