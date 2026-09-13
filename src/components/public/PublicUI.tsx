import Link from "next/link";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";

export function PublicContainer({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`public-container ${className}`} {...props} />;
}

export function PublicSectionHeading({ id, eyebrow, title, children }: { id?: string; eyebrow?: string; title: string; children?: ReactNode }) {
  return <div className="public-section-heading">
    {eyebrow && <p className="public-eyebrow">{eyebrow}</p>}
    <h2 id={id} className="public-title">{title}</h2>
    {children && <div className="public-description">{children}</div>}
  </div>;
}

export function PublicCard({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <article className={`public-card ${className}`} {...props} />;
}

export function PublicLinkButton({ className = "", variant = "primary", ...props }: ComponentProps<typeof Link> & { variant?: "primary" | "secondary" }) {
  return <Link className={`public-button public-button--${variant} ${className}`} {...props} />;
}
