export const BUSINESS_IDENTITY = {
  legalName: "OBAOL",
  brandName: "OBAOL Supreme",
  website: "https://obaol.com",
  email: "info@support.obaol.com",
  linkedin: "https://www.linkedin.com/company/obaol",
  foundingDate: "2020-01-01",
  address: {
    streetAddress: "Palarivattom",
    addressLocality: "Ernakulam",
    addressRegion: "Kerala",
    addressCountry: "IN",
  },
};

export const TRUST_POLICY_LINKS = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms & Conditions", href: "/terms-and-conditions" },
  { name: "Disclaimer", href: "/disclaimer" },
] as const;

export const ORGANIZATION_SAME_AS = [BUSINESS_IDENTITY.linkedin];
