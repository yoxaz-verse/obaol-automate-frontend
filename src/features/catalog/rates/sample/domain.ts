import { buildSampleRequestPayload, validateSampleRequest, type RateRow, type SampleRequestDraft, type UnknownRecord } from "../domain";

export const SAMPLE_COOLDOWN_DAYS = 3;

export interface LocationOption extends UnknownRecord {
  _id: string;
  name: string;
  state?: string | { _id?: string };
}

export interface PincodeOption extends UnknownRecord {
  _id: string;
  pincode: string;
  officename?: string;
  divisionname?: string;
}

export interface RecentSampleRequest extends UnknownRecord {
  requestedAt?: string;
  status?: string;
}

export interface SampleRate extends RateRow {
  _id?: string;
  product?: string;
  productVariant?: string;
}

export interface SampleFormState {
  state: string;
  district: string;
  division: string;
  address: string;
  pincode: string;
  quantityKg: string;
  buyerAssociateId: string;
  buyerAssociateName: string;
  pincodeSearch: string;
}

export const EMPTY_SAMPLE_FORM: SampleFormState = {
  state: "", district: "", division: "", address: "", pincode: "",
  quantityKg: "", buyerAssociateId: "", buyerAssociateName: "", pincodeSearch: "",
};

export const filterDistricts = (districts: LocationOption[], stateId: string) =>
  districts.filter((district) => {
    const state = typeof district.state === "string" ? district.state : district.state?._id;
    return String(state || "") === String(stateId);
  });

export interface SampleCooldown {
  active: boolean;
  remainingDays: number;
  nextAllowedAt: Date | null;
  label: string;
}

export const calculateSampleCooldown = (
  request: RecentSampleRequest | null,
  now = new Date(),
): SampleCooldown => {
  const requestedAt = request?.requestedAt ? new Date(request.requestedAt) : null;
  const status = String(request?.status || "").toUpperCase();
  if (!requestedAt || Number.isNaN(requestedAt.getTime()) || ["REJECTED", "CANCELLED"].includes(status)) {
    return { active: false, remainingDays: 0, nextAllowedAt: null, label: "Request Sample" };
  }
  const nextAllowedAt = new Date(requestedAt.getTime() + SAMPLE_COOLDOWN_DAYS * 86_400_000);
  const active = nextAllowedAt.getTime() > now.getTime();
  const remainingDays = active ? Math.max(1, Math.ceil((nextAllowedAt.getTime() - now.getTime()) / 86_400_000)) : 0;
  return {
    active,
    remainingDays,
    nextAllowedAt,
    label: active
      ? `Sample already requested. Try again in ${remainingDays} day${remainingDays === 1 ? "" : "s"}.`
      : "Request Sample",
  };
};

export const toSampleDraft = (
  rateId: string,
  form: SampleFormState,
  includeBuyer: boolean,
): SampleRequestDraft => ({
  variantRateId: rateId,
  state: form.state,
  district: form.district,
  division: form.division,
  address: form.address,
  pincode: form.pincode,
  quantityKg: form.quantityKg,
  includeBuyer,
  buyerAssociateId: form.buyerAssociateId,
});

export { buildSampleRequestPayload, validateSampleRequest };
