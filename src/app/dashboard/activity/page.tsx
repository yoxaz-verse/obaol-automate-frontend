"use client";

import React from "react";
import { Tabs, Tab } from "@nextui-org/react";

export default function ProjectsPage() {
  const [currentTable, setCurrentTable] = React.useState("projects"); // Default tab

  const tabs = [
    { key: "activity", title: "Activity" },
    // Add more tabs if needed, e.g., "Archived Projects"
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-6xl">
        <div className="my-4">
          <Tabs
            aria-label="Activity Tabs"
            selectedKey={currentTable}
            onSelectionChange={(key) => setCurrentTable(key as string)}
          >
            {tabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                {/* <ActivityTabContent currentTable={tab.key} /> */}
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
