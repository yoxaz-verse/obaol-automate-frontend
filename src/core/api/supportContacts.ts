export type SupportContact = {
  _id: string;
  label: string;
  phoneNumber: string;
  displayPhoneNumber: string;
  phoneCountryCode: string;
  phoneNational: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export const supportContactLinks = (contact: Pick<SupportContact, "phoneNumber">) => {
  const e164 = String(contact.phoneNumber || "").trim();
  return {
    call: `tel:${e164}`,
    whatsapp: `https://wa.me/${e164.replace(/\D/g, "")}`,
  };
};
