import React from "react";
import { FiInbox } from "react-icons/fi";
import Link from "next/link";
import StateDisplay from "@/components/ui/StateDisplay";

interface EmptyStateProps {
    title?: string;
    description?: string;
    message?: string;
    icon?: React.ReactNode;
    action?: { label: string; href: string } | React.ReactNode;
    className?: string;
}

export default function EmptyState({
    title = "No Data Found",
    description,
    message = "There are no records to display at the moment.",
    icon = <FiInbox className="text-default-300" size={48} />,
    action,
    className,
}: EmptyStateProps) {
    const actionNode = React.isValidElement(action)
        ? action
        : action && typeof action === "object" && "href" in action
          ? <Link href={action.href} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-obaol-500 px-5 py-2.5 text-sm font-bold text-obaol-950 outline-none transition hover:bg-obaol-400 focus-visible:ring-2 focus-visible:ring-obaol-500 focus-visible:ring-offset-2">{action.label}</Link>
          : undefined;

    return (
        <StateDisplay title={title} description={description ?? message} icon={icon} action={actionNode} className={className} />
    );
}
