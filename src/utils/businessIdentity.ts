export const BUSINESS_IDENTITY = {
  legalName: "OBAOL",
  brandName: "OBAOL Supreme",
  website: "https://obaol.com",
  email: "info@support.obaol.com",
  phoneDisplay: "+91 90193 51483",
  phoneE164: "+919019351483",
  whatsapp: "https://wa.me/919019351483",
  linkedin: "https://www.linkedin.com/company/obaol",
  foundingDate: "2020-01-01",
  address: {
    streetAddress: "Bengaluru",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560001",
    addressCountry: "IN",
  },
};

export const TRUST_POLICY_LINKS = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms & Conditions", href: "/terms-and-conditions" },
  { name: "Disclaimer", href: "/disclaimer" },
] as const;

export const ORGANIZATION_SAME_AS = [BUSINESS_IDENTITY.linkedin];
