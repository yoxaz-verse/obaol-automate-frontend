import Link from "next/link";
import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  primaryAction?: { label: string; href: string };
  secondaryAction?: ReactNode;
};

export default function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs = [],
  primaryAction,
  secondaryAction,
}: PageHeaderProps) {
  return (
    <header className="mb-6 rounded-3xl border db-border-subtle db-panel p-5 md:p-7">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs db-muted">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href ? <Link className="font-semibold hover:text-foreground" href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 max-w-3xl">
          {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-obaol-700 dark:text-obaol-300">{eyebrow}</p>}
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-6 db-muted md:text-base">{description}</p>}
        </div>
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-wrap items-center gap-3">
            {secondaryAction}
            {primaryAction && (
              <Link href={primaryAction.href} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-obaol-500 px-5 py-2.5 text-sm font-bold text-obaol-950 hover:bg-obaol-400">
                {primaryAction.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
