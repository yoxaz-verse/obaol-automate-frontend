"use client";

import Link from "next/link";
import { Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import { LuArrowRight, LuCircleHelp, LuPackageCheck } from "react-icons/lu";
import { getPreviewDefinition } from "@/utils/companyFunctionPreview";

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
};

export default function CompanyFunctionComponent({ slug, priorityRank, perspective = "provided" }: Props) {
  const definition = getPreviewDefinition(slug, perspective);
  if (!definition) return null;

  return (
    <Card className="rounded-2xl border border-default-200 bg-content1 shadow-sm">
      <CardHeader className="flex items-start justify-between gap-4 border-b border-default-200 px-6 py-5 sm:px-8">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold text-foreground sm:text-2xl">{definition.name}</h3>
            {priorityRank ? <Chip size="sm" variant="flat">Priority {priorityRank}</Chip> : null}
          </div>
          <p className="max-w-3xl text-sm leading-6 text-default-600">{definition.description}</p>
        </div>
        <LuPackageCheck className="mt-1 hidden shrink-0 text-default-400 sm:block" size={24} />
      </CardHeader>
      <CardBody className="p-6 sm:p-8">
        <h4 className="mb-4 text-sm font-semibold text-foreground">What you can do</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {definition.actions.map((action, index) => (
            <Link
              key={`${action.href}-${index}`}
              href={action.href}
              className={`group flex min-h-32 flex-col justify-between rounded-xl border p-5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${action.primary ? "border-primary/40 bg-primary/5 hover:bg-primary/10" : "border-default-200 bg-content2/30 hover:border-default-300 hover:bg-content2/60"}`}
            >
              <div>
                {action.primary ? <span className="mb-2 block text-xs font-semibold text-primary">Recommended first step</span> : null}
                <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                  {action.label}<LuArrowRight className="text-primary transition-transform group-hover:translate-x-1" size={15} />
                </span>
                <p className="mt-2 text-sm leading-5 text-default-500">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-lg bg-default-100/60 px-4 py-3 text-xs leading-5 text-default-500">
          <LuCircleHelp className="mt-0.5 shrink-0" size={15} />
          These links open features that are currently available in OBAOL. No simulated activity or estimated performance is shown here.
        </div>
      </CardBody>
    </Card>
  );
}
