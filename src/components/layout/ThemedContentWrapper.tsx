"use client";

import React from "react";
import { PublicContainer } from "@/components/public/PublicUI";

export default function ThemedContentWrapper({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`public-content-wrapper bg-background text-foreground ${className}`}>
            <PublicContainer className="prose prose-neutral prose-headings:font-bold prose-a:text-obaol-700 prose-strong:text-foreground dark:prose-invert dark:prose-a:text-obaol-300">
                {children}
            </PublicContainer>
        </div>
    );
}
