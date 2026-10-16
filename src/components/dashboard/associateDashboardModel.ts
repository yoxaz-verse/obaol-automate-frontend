export type AssociateCapabilityStat = {
  value: number;
  label: string;
  href: string;
};

export type AssociateAttentionAction = {
  eyebrow: string;
  title: string;
  description: string;
  label: string;
  href: string;
  tone: "warning";
};

type AssociateDashboardModelInput = {
  providedCapabilities: string[];
  soughtCapabilities: string[];
  actionRequired: number;
  sellingCount: number;
  liveProducts: number;
  perspective?: "provided" | "sought";
};

export type AssociateWorkspaceKind = "buyer" | "seller" | null;

export const getAssociateWorkspaceKind = (
  slug: string,
  perspective: "provided" | "sought",
): AssociateWorkspaceKind => {
  if (slug === "buyer") return perspective === "provided" ? "buyer" : "seller";
  if (slug === "seller") return perspective === "provided" ? "seller" : "buyer";
  return null;
};

export const buildAssociateDashboardModel = ({
  providedCapabilities,
  soughtCapabilities,
  actionRequired,
  sellingCount,
  liveProducts,
  perspective,
}: AssociateDashboardModelInput) => {
  const provided = new Set(providedCapabilities);
  const sought = new Set(soughtCapabilities);
  const capabilities = new Set([...provided, ...sought]);
  const activeCapabilities = perspective === "provided" ? provided : perspective === "sought" ? sought : capabilities;
  const showBuying = perspective === "provided"
    ? provided.has("buyer") || provided.has("sourcing")
    : perspective === "sought"
      ? sought.has("seller")
      : provided.has("buyer") || sought.has("seller") || capabilities.has("sourcing");
  const showSelling = perspective === "provided"
    ? provided.has("seller")
    : perspective === "sought"
      ? sought.has("buyer")
      : provided.has("seller") || sought.has("buyer");
  const showFunctions = activeCapabilities.size > 0;

  const capabilityStats: Record<"buyer" | "seller", AssociateCapabilityStat> = {
    buyer: {
      value: liveProducts,
      label: `${liveProducts === 1 ? "live listing" : "live listings"} available`,
      href: "/dashboard/marketplace",
    },
    seller: {
      value: sellingCount,
      label: sellingCount === 1 ? "selling enquiry" : "selling enquiries",
      href: "/dashboard/enquiries",
    },
  };

  const attentionAction: AssociateAttentionAction | null = actionRequired > 0
    ? {
        eyebrow: "Needs attention",
        title: `${actionRequired} ${actionRequired === 1 ? "enquiry needs" : "enquiries need"} your response`,
        description: "Review the outstanding acceptance or confirmation steps to keep trade moving.",
        label: "Review enquiries",
        href: "/dashboard/enquiries",
        tone: "warning",
      }
    : null;

  return { showBuying, showSelling, showFunctions, capabilityStats, attentionAction };
};
