// pages/users.tsx
"use client";
import React, { useState } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import UserTabContent from "@/components/dashboard/Users/user-tab-content";

export default function Page() {
  const [currentTable, setCurrentTable] = useState("manager"); // Default role set to 'manager'

  const tables = [
    { key: "inventoryManager", title: "Inventory Managers" }, // Translate Title
    { key: "associate", title: "Associates" }, // Translate Title
    { key: "admin", title: "Admins" }, // Translate Title
    { key: "customer", title: "Customers" }, // Translate Title
    // { key: "worker", title: "Staff" },// Translate Title
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
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
