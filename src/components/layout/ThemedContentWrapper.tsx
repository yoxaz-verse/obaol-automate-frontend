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
        <div className={`bg-background text-foreground min-h-screen ${className}`}>
            <div className="prose prose-neutral dark:prose-invert max-w-4xl mx-auto px-6 py-32">
                {children}
            </div>
        </div>
    );
}
