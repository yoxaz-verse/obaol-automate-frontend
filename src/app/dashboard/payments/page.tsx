"use client";

import React from "react";
import { Tabs, Tab } from "@nextui-org/react";
import Title from "@/components/titles";
import EssentialTabContent from "@/components/dashboard/Essentials/essential-tab-content";

export default function PaymentsHubPage() {
  const [activeTab, setActiveTab] = React.useState("paymentTerm");

  const tabs = [
    { key: "incoterm", title: "Incoterms" },
    { key: "paymentTerm", title: "Payment Terms" },
    { key: "commissionRule", title: "Commission Rules" },
  ];

  return (
    <section>
      <Title title="Payment Rules" />

      <div className="mx-2 md:mx-6 mb-6">
        <div className="mb-4 rounded-2xl border border-default-200/60 bg-content1/95 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-default-400">
            Payment Orchestration
          </p>
          <h2 className="text-base font-semibold text-foreground">
            Centralize incoterms, payment terms, and commission distribution rules.
          </h2>
        </div>

        <div className="mb-6 rounded-2xl border border-default-200/60 bg-content1/95 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-default-400">
            Commission Split (Fixed)
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground">
            <div className="rounded-xl border border-default-200/60 bg-content1/80 p-4">
              <div className="text-xs uppercase tracking-widest text-default-400">Total Commission</div>
              <div className="text-lg font-semibold">50% of profit</div>
            </div>
            <div className="rounded-xl border border-default-200/60 bg-content1/80 p-4">
              <div className="text-xs uppercase tracking-widest text-default-400">Pool</div>
              <div className="text-lg font-semibold">30% of profit</div>
            </div>
            <div className="rounded-xl border border-default-200/60 bg-content1/80 p-4">
              <div className="text-xs uppercase tracking-widest text-default-400">Procurement</div>
              <div className="text-lg font-semibold">10% of profit</div>
            </div>
            <div className="rounded-xl border border-default-200/60 bg-content1/80 p-4">
              <div className="text-xs uppercase tracking-widest text-default-400">Handler</div>
              <div className="text-lg font-semibold">10% of profit</div>
            </div>
            <div className="rounded-xl border border-default-200/60 bg-content1/80 p-4">
              <div className="text-xs uppercase tracking-widest text-default-400">Closer</div>
              <div className="text-lg font-semibold">40% of pool</div>
            </div>
            <div className="rounded-xl border border-default-200/60 bg-content1/80 p-4">
              <div className="text-xs uppercase tracking-widest text-default-400">Portfolio Owner</div>
              <div className="text-lg font-semibold">30% of pool</div>
            </div>
            <div className="rounded-xl border border-default-200/60 bg-content1/80 p-4">
              <div className="text-xs uppercase tracking-widest text-default-400">Leadership L1</div>
              <div className="text-lg font-semibold">12% of pool</div>
            </div>
            <div className="rounded-xl border border-default-200/60 bg-content1/80 p-4">
              <div className="text-xs uppercase tracking-widest text-default-400">Leadership L2</div>
              <div className="text-lg font-semibold">8% of pool</div>
            </div>
            <div className="rounded-xl border border-default-200/60 bg-content1/80 p-4">
              <div className="text-xs uppercase tracking-widest text-default-400">Leadership L3+</div>
              <div className="text-lg font-semibold">10% of pool (max 5% each)</div>
            </div>
          </div>
        </div>

        <Tabs
          aria-label="Payment Rules Tabs"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(String(key))}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} title={tab.title}>
              <Title title={tab.title} />
              <EssentialTabContent essentialName={tab.key} />
            </Tab>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
