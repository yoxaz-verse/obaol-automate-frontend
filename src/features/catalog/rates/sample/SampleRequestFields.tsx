import { Autocomplete, AutocompleteItem, Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import AssociateSearch from "@/components/dashboard/Users/AssociateSearch";
import type { LocationOption, PincodeOption, SampleFormState } from "./domain";

interface Props {
  form: SampleFormState;
  includeBuyer: boolean;
  states: LocationOption[];
  districts: LocationOption[];
  divisions: LocationOption[];
  pincodes: PincodeOption[];
  divisionsLoading: boolean;
  pincodesLoading: boolean;
  queryError: unknown;
  retry: () => Promise<unknown>;
  update: <K extends keyof SampleFormState>(key: K, value: SampleFormState[K]) => void;
  selectState: (value: string) => void;
  selectDistrict: (value: string) => void;
  selectDivision: (value: string) => void;
}

const selectedKey = (keys: "all" | Set<React.Key>) => String(Array.from(keys === "all" ? [] : keys)[0] || "");
const selectClasses = { label: "text-[10px] font-black uppercase tracking-widest text-default-400 mb-1.5", trigger: "h-12 rounded-2xl border-divider/50 hover:border-primary" };

export const SampleRequestFields = ({ form, includeBuyer, states, districts, divisions, pincodes, divisionsLoading, pincodesLoading, queryError, retry, update, selectState, selectDistrict, selectDivision }: Props) => (
  <>
    {queryError && (
      <div className="rounded-2xl border border-danger-300 bg-danger-50 p-3 text-xs text-danger-700">
        Location options could not be loaded.
        <Button size="sm" variant="light" color="danger" onPress={() => void retry()}>Retry</Button>
      </div>
    )}
    {includeBuyer && (
      <div className="rounded-3xl border border-divider/50 bg-foreground/[0.03] p-5">
        <h4 className="mb-2 ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-default-400">Buyer Associate Selection</h4>
        <AssociateSearch
          onSelect={(associate) => { update("buyerAssociateId", associate?._id || ""); update("buyerAssociateName", associate?.name || ""); }}
          onSearchChange={(name) => update("buyerAssociateName", name)}
        />
      </div>
    )}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Select label="State Protocol" labelPlacement="outside" placeholder="Select state" variant="bordered" classNames={selectClasses} selectedKeys={form.state ? [form.state] : []} onSelectionChange={(keys) => selectState(selectedKey(keys))}>
        {states.map((item) => <SelectItem key={item._id}>{item.name}</SelectItem>)}
      </Select>
      <Select label="District Registry" labelPlacement="outside" placeholder="Select district" variant="bordered" classNames={selectClasses} selectedKeys={form.district ? [form.district] : []} isDisabled={!form.state} onSelectionChange={(keys) => selectDistrict(selectedKey(keys))}>
        {districts.map((item) => <SelectItem key={item._id}>{item.name}</SelectItem>)}
      </Select>
    </div>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Select label="Postal Division" labelPlacement="outside" placeholder={divisionsLoading ? "Loading divisions..." : "Select division"} variant="bordered" classNames={selectClasses} selectedKeys={form.division ? [form.division] : []} isDisabled={!form.district || divisionsLoading} isLoading={divisionsLoading} onSelectionChange={(keys) => selectDivision(selectedKey(keys))}>
        {divisions.map((item) => <SelectItem key={item._id}>{item.name}</SelectItem>)}
      </Select>
      <Autocomplete
        label="Pincode Lookup" labelPlacement="outside" placeholder={pincodesLoading ? "Searching..." : "Pincode or Office"}
        variant="bordered" isLoading={pincodesLoading} allowsCustomValue isDisabled={!form.division}
        inputValue={form.pincodeSearch}
        onSelectionChange={(key) => { const item = pincodes.find((option) => option._id === String(key || "")); if (item) { update("pincode", item.pincode); update("pincodeSearch", item.pincode); } }}
        onInputChange={(value) => { update("pincode", value); update("pincodeSearch", value); }}
      >
        {pincodes.map((item) => <AutocompleteItem key={item._id} textValue={item.pincode} description={`${item.officename || ""} - ${item.divisionname || ""}`}>{item.pincode}</AutocompleteItem>)}
      </Autocomplete>
    </div>
    <Textarea label="Detailed Delivery Address" labelPlacement="outside" placeholder="Street, locality, landmark..." variant="bordered" minRows={3} value={form.address} onValueChange={(value) => update("address", value)} />
    <Input label="Target Quantity (KG)" labelPlacement="outside" placeholder="Enter quantity in kg" variant="bordered" type="number" min={0} value={form.quantityKg} onValueChange={(value) => update("quantityKg", value)} />
  </>
);
