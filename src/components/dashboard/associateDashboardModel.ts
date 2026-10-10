export type AssociateMetric = {
  key: "actions" | "buying" | "selling" | "orders" | "listings";
  label: string;
  value: number;
  description: string;
  href: string;
};

export type AssociatePrimaryAction = {
  eyebrow: string;
  title: string;
  description: string;
  label: string;
  href: string;
  tone: "warning" | "primary" | "success";
};

type AssociateDashboardModelInput = {
  providedCapabilities: string[];
  soughtCapabilities: string[];
  actionRequired: number;
  buyingCount: number;
  sellingCount: number;
  activeOrders: number;
  liveProducts: number;
};

export const buildAssociateDashboardModel = ({
  providedCapabilities,
  soughtCapabilities,
  actionRequired,
  buyingCount,
  sellingCount,
  activeOrders,
  liveProducts,
}: AssociateDashboardModelInput) => {
  const provided = new Set(providedCapabilities);
  const sought = new Set(soughtCapabilities);
  const capabilities = new Set([...provided, ...sought]);
  const showBuying = provided.has("buyer") || sought.has("seller") || capabilities.has("sourcing");
  const showSelling = provided.has("seller") || sought.has("buyer");
  const showFunctions = capabilities.size > 0;

  const metrics: AssociateMetric[] = [
    {
      key: "actions",
      label: "Action required",
      value: actionRequired,
      description: "Enquiries waiting for your response",
      href: "/dashboard/enquiries",
    },
    ...(showBuying ? [{
      key: "buying" as const,
      label: "Buying enquiries",
      value: buyingCount,
      description: "Enquiries where you are the buyer",
      href: "/dashboard/enquiries",
    }] : []),
    ...(showSelling ? [{
      key: "selling" as const,
      label: "Selling enquiries",
      value: sellingCount,
      description: "Enquiries where you are the supplier",
      href: "/dashboard/enquiries",
    }, {
      key: "listings" as const,
      label: "Live listings",
      value: liveProducts,
      description: "Products currently visible to buyers",
      href: "/dashboard/product",
    }] : []),
    {
      key: "orders",
      label: "Active orders",
      value: activeOrders,
      description: "Orders currently in progress",
      href: "/dashboard/orders",
    },
  ];

  const primaryAction: AssociatePrimaryAction = actionRequired > 0
    ? {
        eyebrow: "Needs attention",
        title: `${actionRequired} ${actionRequired === 1 ? "enquiry needs" : "enquiries need"} your response`,
        description: "Review the outstanding acceptance or confirmation steps to keep trade moving.",
        label: "Review enquiries",
        href: "/dashboard/enquiries",
        tone: "warning",
      }
    : !showBuying && !showSelling
      ? {
          eyebrow: "Next best action",
          title: "Review your service execution work",
          description: "Track requests and orders connected to your company capabilities.",
          label: "Open execution panel",
          href: "/dashboard/execution-enquiries",
          tone: "primary",
        }
      : showBuying && !showSelling
        ? {
            eyebrow: "Next best action",
            title: "Discover a verified product",
            description: "Compare live trade listings and start a buying enquiry.",
            label: "Browse trade listings",
            href: "/dashboard/marketplace",
            tone: "primary",
          }
        : showSelling && !showBuying
          ? {
              eyebrow: "Next best action",
              title: liveProducts > 0 ? "Keep your listings current" : "Publish your first trade listing",
              description: liveProducts > 0
                ? "Review pricing and availability so buyers see accurate offers."
                : "Add a product and rate to become discoverable to buyers.",
              label: "Manage listings",
              href: "/dashboard/product",
              tone: "success",
            }
          : {
              eyebrow: "Next best action",
              title: "Continue your trade activity",
              description: "Discover opportunities or keep your current listings up to date.",
              label: "Browse trade listings",
              href: "/dashboard/marketplace",
              tone: "primary",
            };

  return { showBuying, showSelling, showFunctions, metrics, primaryAction };
};
