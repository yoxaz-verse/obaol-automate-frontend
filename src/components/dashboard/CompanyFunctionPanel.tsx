"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Button, Card, CardBody, CardHeader, Chip, Divider } from "@nextui-org/react";
import { LuArrowRight, LuActivity, LuClipboardList, LuPackageCheck } from "react-icons/lu";

type FunctionMetrics = {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
};

type ActionLink = {
  label: string;
  href: string;
};

type Props = {
  name: string;
  slug: string;
  priorityRank?: number | null;
  metrics: FunctionMetrics;
};

const ACTIONS_BY_SLUG: Record<string, ActionLink[]> = {
  "sourcing": [
    { label: "Enquiries", href: "/dashboard/enquiries" },
    { label: "Marketplace", href: "/dashboard/marketplace" },
    { label: "My Product", href: "/dashboard/product" },
  ],
  "packaging": [
    { label: "Execution", href: "/dashboard/execution-enquiries" },
    { label: "Orders", href: "/dashboard/orders" },
    { label: "Documents", href: "/dashboard/documents" },
  ],
  "testing": [
    { label: "Documents", href: "/dashboard/documents" },
    { label: "Execution", href: "/dashboard/execution-enquiries" },
    { label: "Orders", href: "/dashboard/orders" },
  ],
  "warehouse-storage": [
    { label: "Warehouses", href: "/dashboard/warehouses" },
    { label: "Inventory", href: "/dashboard/inventory" },
    { label: "Warehouse Space", href: "/dashboard/warehouse-rent" },
  ],
  "freight-forwarding": [
    { label: "Execution", href: "/dashboard/execution-enquiries" },
    { label: "Orders", href: "/dashboard/orders" },
    { label: "Documents", href: "/dashboard/documents" },
  ],
  "importing-distribution": [
    { label: "Imports", href: "/dashboard/imports" },
    { label: "Orders", href: "/dashboard/orders" },
    { label: "Execution", href: "/dashboard/execution-enquiries" },
  ],
  "inland-logistics": [
    { label: "Execution", href: "/dashboard/execution-enquiries" },
    { label: "Orders", href: "/dashboard/orders" },
    { label: "Warehouses", href: "/dashboard/warehouses" },
  ],
  "finance-risk": [
    { label: "Orders", href: "/dashboard/orders" },
    { label: "Enquiries", href: "/dashboard/enquiries" },
    { label: "Documents", href: "/dashboard/documents" },
  ],
};

const defaultActions: ActionLink[] = [
  { label: "Enquiries", href: "/dashboard/enquiries" },
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Documents", href: "/dashboard/documents" },
];

export default function CompanyFunctionPanel({ name, slug, priorityRank, metrics }: Props) {
  const actions = useMemo(() => {
    const key = String(slug || "").toLowerCase();
    return ACTIONS_BY_SLUG[key] || defaultActions;
  }, [slug]);

  const showNoKpi = String(slug || "").toLowerCase() === "finance-risk";

  return (
    <Card className="border border-default-200/60 bg-content1/70 shadow-sm">
      <CardHeader className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-foreground">{name}</h4>
            {priorityRank ? (
              <Chip size="sm" variant="flat" color="warning">
                Priority {priorityRank}
              </Chip>
            ) : null}
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-default-400">{slug}</span>
        </div>
        <Chip size="sm" variant="flat" color="primary">
          {metrics.total} Total
        </Chip>
      </CardHeader>
      <Divider />
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-default-200/60 bg-content2/40 p-3">
            <div className="flex items-center gap-2 text-xs text-default-500">
              <LuClipboardList size={14} />
              Open
            </div>
            <div className="text-lg font-bold text-foreground">{metrics.open}</div>
          </div>
          <div className="rounded-xl border border-default-200/60 bg-content2/40 p-3">
            <div className="flex items-center gap-2 text-xs text-default-500">
              <LuActivity size={14} />
              In Progress
            </div>
            <div className="text-lg font-bold text-foreground">{metrics.inProgress}</div>
          </div>
          <div className="rounded-xl border border-default-200/60 bg-content2/40 p-3">
            <div className="flex items-center gap-2 text-xs text-default-500">
              <LuPackageCheck size={14} />
              Completed
            </div>
            <div className="text-lg font-bold text-foreground">{metrics.completed}</div>
          </div>
        </div>
        {showNoKpi ? (
          <div className="text-xs text-warning-600">No KPI yet for this function.</div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action.href}
              as={Link}
              href={action.href}
              size="sm"
              variant="flat"
              color="primary"
              endContent={<LuArrowRight className="w-3 h-3" />}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
