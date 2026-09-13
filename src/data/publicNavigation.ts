import { associateRoleDefinitions, getAssociateRolePath } from "@/data/associateRoles";

export type PublicNavLink = { href: string; label: string };
export type PublicNavGroup = {
  label: string;
  icon: "platform" | "roles" | "trade" | "resources" | "trust";
  links: PublicNavLink[];
};

export const primaryPublicLinks: PublicNavLink[] = [
  { href: "/about", label: "Platform" },
  { href: "/roles", label: "Roles" },
  { href: "/trade-directory", label: "Catalog" },
];

export const publicNavigation: PublicNavGroup[] = [
  { label: "Platform", icon: "platform", links: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About OBAOL" },
    { href: "/why-obaol", label: "Why OBAOL" },
    { href: "/how-it-works", label: "How It Works" },
  ] },
  { label: "Roles", icon: "roles", links: [
    { href: "/roles", label: "Roles overview" },
    { href: "/roles/associate", label: "Associates" },
    { href: "/roles/operator", label: "Operators" },
    ...associateRoleDefinitions.map((role) => ({ href: getAssociateRolePath(role.slug), label: role.displayName })),
  ] },
  { label: "Trade & Services", icon: "trade", links: [
    { href: "/trade-directory", label: "Catalog" },
    { href: "/product", label: "Products" },
    { href: "/companies", label: "Companies" },
    { href: "/obaol", label: "OBAOL marketplace" },
    { href: "/quick-commerce-procurement", label: "Quick Commerce" },
    { href: "/procurement", label: "Procurement" },
    { href: "/verification", label: "Verification" },
    { href: "/trade-finance", label: "Trade Finance" },
  ] },
  { label: "Resources", icon: "resources", links: [
    { href: "/faq", label: "FAQs" },
    { href: "/export-resources", label: "Export Resources" },
    { href: "/commission-structure", label: "Commission Structure" },
    { href: "/methods", label: "Methods" },
    { href: "/developer", label: "Developer overview" },
  ] },
  { label: "Trust & Legal", icon: "trust", links: [
    { href: "/trust", label: "Trust & Verification" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-and-conditions", label: "Terms & Conditions" },
    { href: "/disclaimer", label: "Disclaimer" },
  ] },
];
