// pages/users.tsx
"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, Tab } from "@nextui-org/react";

const UserTabContent = dynamic(() => import("@/components/dashboard/Users/user-tab-content"), {
  loading: () => <div className="min-h-[360px] rounded-2xl border border-default-200 bg-content1/70" />,
});

export default function Page() {
  const [currentTable, setCurrentTable] = useState("manager"); // Default role set to 'manager'

  const tables = [
    { key: "inventoryManager", title: "Inventory Managers" }, // Translate Title
    { key: "associate", title: "Associates" }, // Translate Title
    { key: "admin", title: "Admins" }, // Translate Title
    { key: "operator", title: "Operator" }, // Translate Title
    // { key: "worker", title: "Staff" },// Translate Title
  ];

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
            {tables.map((table) => (
              <Tab key={table.key} title={table.title}>
                {/* Render UserTabContent for the current table */}
                <UserTabContent currentTable={table.key} />
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
