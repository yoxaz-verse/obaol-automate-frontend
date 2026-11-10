"use client";

import React from "react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { FiHome, FiChevronRight } from "react-icons/fi";

interface CatalogBreadcrumbsProps {
    paths: { id: string | null; name: string }[];
    onNavigate: (index: number) => void;
}

export default function CatalogBreadcrumbs({ paths, onNavigate }: CatalogBreadcrumbsProps) {
    return (
        <div className="mb-6 flex items-center px-1">
            <Breadcrumbs
                separator={<FiChevronRight className="text-default-600" size={14} />}
                itemClasses={{
                    item: "cursor-pointer rounded-sm font-semibold text-default-700 transition-colors hover:text-obaol-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 focus-visible:ring-offset-2 dark:hover:text-obaol-300 data-[current=true]:font-bold data-[current=true]:text-foreground",
                    separator: "px-2"
                }}
            >
                {paths.map((p, i) => (
                    <BreadcrumbItem
                        key={i}
                        isCurrent={i === paths.length - 1}
                        onClick={() => onNavigate(i)}
                        startContent={i === 0 ? <FiHome size={14} className="mr-1" /> : null}
                    >
                        {p.name}
                    </BreadcrumbItem>
                ))}
            </Breadcrumbs>
        </div>
    );
}
