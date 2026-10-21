// pages/users.tsx
"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Tabs, Tab } from "@nextui-org/react";

const CustomerSupportAgents = dynamic(
  () => import("@/components/dashboard/Users/customer-support-agents"),
  { loading: () => <UserPanelPlaceholder /> }
);

const UserTabContent = dynamic(() => import("@/components/dashboard/Users/user-tab-content"), {
  loading: () => <UserPanelPlaceholder />,
});

function UserPanelPlaceholder() {
  return <div className="min-h-[360px] animate-pulse rounded-2xl border border-default-200 bg-content1/70 motion-reduce:animate-none" role="status" aria-label="Loading users" />;
}

const USER_TABLES = [
  { key: "customerSupport", title: "Customer Support" },
  { key: "inventoryManager", title: "Inventory Managers" }, // Translate Title
  { key: "associate", title: "Associates" }, // Translate Title
  { key: "admin", title: "Admins" }, // Translate Title
  { key: "operator", title: "Operator" }, // Translate Title
  // { key: "worker", title: "Staff" },// Translate Title
];

export default function Page() {
  const searchParams = useSearchParams();
  const [currentTable, setCurrentTable] = useState("customerSupport");

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab && USER_TABLES.some((table) => table.key === requestedTab)) {
      setCurrentTable(requestedTab);
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center w-full min-w-0 max-w-full">
      <div className="w-full min-w-0 max-w-full">
        <div className="my-4">
          {/* Tabs for selecting between different roles */}
          <Tabs
            aria-label="User Types" // Translate
            selectedKey={currentTable}
            onSelectionChange={(key) => setCurrentTable(key as string)}
          >
            {USER_TABLES.map((table) => (
              <Tab key={table.key} title={table.title}>
                {/* Render UserTabContent for the current table */}
                {table.key === currentTable
                  ? table.key === "customerSupport"
                    ? <CustomerSupportAgents />
                    : <UserTabContent currentTable={table.key} />
                  : null}
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
