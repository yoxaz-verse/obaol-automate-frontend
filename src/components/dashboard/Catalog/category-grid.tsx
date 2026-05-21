"use client";

import React from "react";
import { FiFolder, FiPackage, FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface Item {
    _id: string;
    name: string;
    description?: string;
    isConventional?: boolean;
    isNatural?: boolean;
    isOrganic?: boolean;
    isGiTagged?: boolean;
}

interface CategoryGridProps {
    items: Item[];
    onSelect: (item: Item) => void;
    type: "category" | "subcategory" | "product";
    counts?: Record<string, number>;
    onEdit?: (item: Item) => void;
    onDelete?: (item: Item) => void;
    isAdmin?: boolean;
    cardThemeClass?: string;
    cardBorderClass?: string;
}

export default function CategoryGrid({
    items,
    onSelect,
    type,
    counts,
    onEdit,
    onDelete,
    isAdmin,
    cardThemeClass,
    cardBorderClass,
}: CategoryGridProps) {
    const getClassification = (item: Item) => {
        const labels: string[] = [];
        if (item.isNatural) labels.push("Natural");
        if (item.isOrganic) labels.push("Organic");
        if (item.isGiTagged) labels.push("GI Tag");
        if (labels.length === 0 && type === "product") labels.push("Conventional");
        return labels;
    };
    const Icon = type === "product" ? FiPackage : FiFolder;
    const colorClass = "text-warning-600";
    const bgClass = "bg-warning-500/10";
    const listAnimationKey = `${type}-${items.map((item) => item._id).join("|")}`;

    const gridVariants = {
        hidden: {},
        visible: {
            transition: {
                delayChildren: 0.02,
                staggerChildren: 0.055,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.26,
                ease: [0.22, 1, 0.36, 1] as const,
            },
        },
        exit: {
            opacity: 0,
            y: 6,
            transition: {
                duration: 0.18,
                ease: [0.22, 1, 0.36, 1] as const,
            },
        },
    };

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={listAnimationKey}
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 w-full"
            >
                {items.map((item) => {
                    const count = counts ? counts[item._id] || 0 : 0;

                    return (
                        <motion.div
                            key={item._id}
                            variants={itemVariants}
                            whileHover={{ y: -2 }}
                            className={`group border backdrop-blur-md hover:border-warning-500/30 transition-all shadow-lg hover:shadow-warning-500/5 rounded-xl sm:rounded-2xl cursor-pointer relative ${cardThemeClass || "bg-gradient-to-br from-white/[0.03] to-transparent"} ${cardBorderClass || "border-foreground/10"}`}
                            onClick={() => onSelect(item)}
                        >
                            <div className="p-3 sm:p-4 lg:p-5 flex flex-col items-start gap-2.5 sm:gap-3">
                                <div className="flex justify-between items-start w-full">
                                    <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${bgClass} ${colorClass} group-hover:scale-105 transition-transform`}>
                                        <Icon size={22} />
                                    </div>

                                    {isAdmin && (
                                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                            {onEdit && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                                    className="p-1.5 sm:p-2 rounded-lg bg-foreground/5 text-default-400 hover:bg-warning-500/10 hover:text-warning-500 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                                                    className="p-1.5 sm:p-2 rounded-lg bg-foreground/5 text-default-400 hover:bg-danger-500/10 hover:text-danger-500 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 w-full mt-1.5">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground line-clamp-2 leading-tight">{item.name}</h3>
                                        <FiArrowRight className="shrink-0 mt-0.5 text-default-300 group-hover:text-warning-500 group-hover:translate-x-1 transition-all" size={16} />
                                    </div>
                                    {type === "product" && (
                                        <div className="mb-1.5 flex flex-wrap gap-1">
                                            {getClassification(item).map((label) => (
                                                <span
                                                    key={`${item._id}-${label}`}
                                                    className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider border border-warning-500/20 bg-warning-500/10 text-warning-500"
                                                >
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {item.description ? (
                                        <p className="text-[11px] sm:text-xs text-default-400 line-clamp-2 min-h-[2.1rem] leading-snug italic">{item.description}</p>
                                    ) : (
                                        <div className="min-h-[2.1rem]" />
                                    )}
                                </div>

                                {counts && (
                                    <div className="w-full pt-2.5 sm:pt-3 border-t border-foreground/5 flex items-center justify-between gap-2">
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] text-default-400 line-clamp-1">
                                            Collection
                                        </span>
                                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-warning-500/10 text-[9px] sm:text-[10px] font-bold text-warning-600 shrink-0">
                                            {count} Items
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </AnimatePresence>
    );
}
