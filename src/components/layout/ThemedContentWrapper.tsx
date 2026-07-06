"use client";

import React from "react";

export default function ThemedContentWrapper({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`min-h-screen bg-background text-foreground ${className}`}>
            <div className="prose prose-neutral mx-auto max-w-7xl px-6 py-32 prose-headings:font-bold prose-a:text-obaol-700 prose-strong:text-foreground dark:prose-invert dark:prose-a:text-obaol-300">
                {children}
            </div>
        </div>
    );
}
