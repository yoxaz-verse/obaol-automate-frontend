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
                separator={<FiChevronRight className="text-default-400" size={14} />}
                itemClasses={{
                    item: "text-foreground/60 data-[current=true]:text-foreground data-[current=true]:font-bold hover:text-orange-500 transition-colors cursor-pointer",
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
