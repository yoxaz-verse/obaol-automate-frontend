// pages/users.tsx
"use client";
import React, { useState } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import UserTabContent from "@/components/dashboard/Users/user-tab-content";

export default function Page() {
  const [currentTable, setCurrentTable] = useState("manager"); // Default role set to 'manager'

  const tables = [
    { key: "manager", title: "Managers" },
    { key: "admin", title: "Admins" },
    { key: "customer", title: "Customers" },
    { key: "worker", title: "Workers" },
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="my-4">
          {/* Tabs for selecting between different roles */}
          <Tabs
            aria-label="User Types"
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
