"use client";

import UserTabContent from "@/components/dashboard/Users/user-tab-content";
import PageHeader from "@/components/ui/PageHeader";

export default function FreightAssociatesPage() {
  return (
    <main className="space-y-6 pb-16">
      <PageHeader
        variant="plain"
        eyebrowTone="brand"
        eyebrow="Freight · Administration"
        title="Freight Associates"
        description="View and manage associates belonging to companies that provide freight-forwarding services."
      />
      <UserTabContent
        currentTable="associate"
        lockedFilters={{ companyCapability: "freight-forwarding" }}
        showAdd={false}
        showDelete={false}
      />
    </main>
  );
}
