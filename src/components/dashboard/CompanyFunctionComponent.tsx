"use client";

import Link from "next/link";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { LuArrowRight } from "react-icons/lu";
import { getCompanyFunctionRoleContext, getPreviewDefinition } from "@/utils/companyFunctionPreview";

type Props = {
  name: string;
  slug: string;
  priorityRank?: number | null;
  metrics: { total: number; open: number; inProgress: number; completed: number };
  recentExecutionInquiries?: unknown[];
  recentOrders?: unknown[];
  previewMode?: boolean;
  placeholderRecommended?: boolean;
  perspective?: "provided" | "sought";
  stat?: { value: number; label: string; href: string } | null;
};

export default function CompanyFunctionComponent({ slug, priorityRank, perspective = "provided", stat }: Props) {
  const definition = getPreviewDefinition(slug, perspective);
  if (!definition) return null;
  const context = getCompanyFunctionRoleContext(slug, perspective);

  return (
    <Card className="h-full rounded-2xl border border-obaol-500/30 bg-obaol-500/5 shadow-sm">
      <CardBody className="flex h-full flex-col gap-4 p-5 sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-foreground">{definition.name}</h3>
            {priorityRank ? <Chip size="sm" variant="flat">Priority {priorityRank}</Chip> : null}
            <Chip size="sm" variant="flat" className="bg-obaol-500/15 font-bold text-obaol-700 dark:text-obaol-300">{context.perspectiveLabel}</Chip>
          </div>
          <p className="mt-2 text-sm font-semibold text-obaol-700 dark:text-obaol-300">{context.roleLabel}</p>
          <p className="mt-1 text-sm leading-6 text-default-600">{context.explanation}</p>
        </div>
        {stat ? <Link href={stat.href} className="flex items-center justify-between rounded-xl border border-default-200 bg-content1/70 px-4 py-3 hover:bg-content1"><span><b className="text-xl text-foreground">{stat.value.toLocaleString()}</b><span className="ml-2 text-sm font-semibold text-default-600">{stat.label}</span></span><LuArrowRight /></Link> : null}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {definition.actions.map((action, index) => (
            <Link
              key={`${action.href}-${index}`}
              href={action.href}
              className={`group rounded-xl border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${action.primary ? "border-obaol-500/40 bg-obaol-500/10 hover:bg-obaol-500/15" : "border-default-200 bg-content1/60 hover:bg-content1"}`}
            >
              {action.primary ? <span className="mb-1 block text-[11px] font-semibold text-obaol-700 dark:text-obaol-300">Recommended first step</span> : null}
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">{action.label}<LuArrowRight className="transition-transform group-hover:translate-x-1" size={14} /></span>
              <p className="mt-1 text-xs leading-5 text-default-500">{action.description}</p>
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
