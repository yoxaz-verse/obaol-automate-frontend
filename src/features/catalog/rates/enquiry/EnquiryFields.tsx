import { Button, Card, CardBody } from "@nextui-org/react";
import { FiMessageSquare } from "react-icons/fi";
import { buyerLabel, type BuyerOption, type EnquiryFormState, type IncotermOption } from "./domain";

interface Props {
  form: EnquiryFormState; buyers: BuyerOption[]; incoterms: IncotermOption[];
  representsBuyer: boolean; buyerOptionsLoading: boolean; loading: boolean;
  disclosure: { message: string } | null;
  update: <K extends keyof EnquiryFormState>(key: K, value: EnquiryFormState[K]) => void;
  selectBuyer: (id: string) => void; submit: () => void;
}
const inputClass = "h-9 w-full rounded-xl border border-default-300 bg-default-50 px-3 text-sm text-foreground outline-none transition-colors focus:border-primary";

export const EnquiryFields = ({ form, buyers, incoterms, representsBuyer, buyerOptionsLoading, loading, disclosure, update, selectBuyer, submit }: Props) => (
  <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="flex flex-col gap-4">
    <Card className="border border-default-200 bg-content1 shadow-sm"><CardBody className="p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {representsBuyer && <Field label="Buyer Associate">
          <select value={form.buyerAssociateId} onChange={(event) => selectBuyer(event.target.value)} className={inputClass} required disabled={buyerOptionsLoading}>
            <option value="">{buyerOptionsLoading ? "Loading buyers..." : "Select buyer"}</option>
            {buyers.map((buyer) => <option key={buyer._id} value={buyer._id}>{buyerLabel(buyer)}</option>)}
          </select>
          {!buyerOptionsLoading && buyers.length === 0 && <p className="text-[11px] text-default-500">No active buyer associates available.</p>}
        </Field>}
        <Field label="Full Name"><input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" /></Field>
        <Field label="Phone Number"><input className={inputClass} type="tel" value={form.phoneNumber} onChange={(event) => update("phoneNumber", event.target.value)} autoComplete="tel" /></Field>
        <Field label="Quantity (Ton)"><input className={inputClass} type="number" min={1} value={form.quantity} onChange={(event) => update("quantity", event.target.value)} required /></Field>
        <Field label="Preferred Incoterm">
          <select value={form.preferredIncotermId} onChange={(event) => update("preferredIncotermId", event.target.value)} disabled={incoterms.length === 0} className={inputClass}>
            <option value="">Choose incoterm</option>
            {incoterms.map((item) => <option key={item._id} value={item._id}>{item.code || "NA"} - {item.name || "Incoterm"}</option>)}
          </select>
        </Field>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <label className="text-xs font-semibold text-default-600">Specification (Optional)</label>
        <textarea className={`min-h-[90px] w-full resize-y rounded-xl border bg-default-50 px-3 py-2 text-sm text-foreground outline-none ${disclosure ? "border-danger" : "border-default-300 focus:border-primary"}`} value={form.specification} onChange={(event) => update("specification", event.target.value)} aria-invalid={Boolean(disclosure)} aria-describedby={disclosure ? "enquiry-specification-error" : undefined} />
        {disclosure && <p id="enquiry-specification-error" role="alert" className="text-xs text-danger">{disclosure.message}</p>}
      </div>
    </CardBody></Card>
    <div className="flex items-center justify-between gap-2"><span className="text-xs text-default-500">Tip: 1 Ton = 1,000 KG</span><Button type="submit" isLoading={loading} isDisabled={loading || Boolean(disclosure)} color="primary" size="sm" className="min-w-[160px] rounded-lg font-semibold" startContent={!loading && <FiMessageSquare size={14} />}>{loading ? "Submitting..." : "Create Enquiry"}</Button></div>
  </form>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="flex flex-col gap-2"><label className="text-xs font-semibold text-default-600">{label}</label>{children}</div>;
