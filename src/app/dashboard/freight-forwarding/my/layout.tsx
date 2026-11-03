import { PublishedProfileShareAction } from "@/components/referrals/PublishedProfileShareAction";
import { freightForwardingRoutes } from "@/core/api/apiRoutes";

export default function MyFreightLayout({ children }: { children: React.ReactNode }) {
  return <><PublishedProfileShareAction endpoint={freightForwardingRoutes.draft} offeringType="FREIGHT" fallbackTitle="Freight forwarding services" />{children}</>;
}
