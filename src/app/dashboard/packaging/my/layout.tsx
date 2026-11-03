import { PublishedProfileShareAction } from "@/components/referrals/PublishedProfileShareAction";
import { packagingRoutes } from "@/core/api/apiRoutes";

export default function MyPackagingLayout({ children }: { children: React.ReactNode }) {
  return <><PublishedProfileShareAction endpoint={packagingRoutes.draft} offeringType="PACKAGING" fallbackTitle="Packaging services" />{children}</>;
}
