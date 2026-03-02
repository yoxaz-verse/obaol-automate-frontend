"use client";

import React from "react";
import { FiFolder, FiPackage, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

interface Item {
    _id: string;
    name: string;
    description?: string;
}

interface CategoryGridProps {
    items: Item[];
    onSelect: (item: Item) => void;
    type: "category" | "subcategory" | "product";
    counts?: Record<string, number>;
    onEdit?: (item: Item) => void;
    onDelete?: (item: Item) => void;
    isAdmin?: boolean;
}

export default function CategoryGrid({
    items,
    onSelect,
    type,
    counts,
    onEdit,
    onDelete,
    isAdmin
}: CategoryGridProps) {
    const Icon = type === "product" ? FiPackage : FiFolder;
    const colorClass = "text-warning-600";
    const bgClass = "bg-warning-500/10";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {items.map((item, index) => {
                const count = counts ? counts[item._id] || 0 : 0;

                return (
                    <motion.div
                        key={item._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="group border border-foreground/10 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-md hover:border-warning-500/30 transition-all shadow-lg hover:shadow-warning-500/5 rounded-2xl cursor-pointer relative"
                        onClick={() => onSelect(item)}
                    >
                        <div className="p-6 flex flex-col items-start gap-4">
                            <div className="flex justify-between items-start w-full">
                                <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} group-hover:scale-110 transition-transform`}>
                                    <Icon size={28} />
                                </div>

                                {isAdmin && (
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        {onEdit && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                                className="p-2 rounded-lg bg-foreground/5 text-default-400 hover:bg-warning-500/10 hover:text-warning-500 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                                                className="p-2 rounded-lg bg-foreground/5 text-default-400 hover:bg-danger-500/10 hover:text-danger-500 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 w-full mt-2">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">{item.name}</h3>
                                    <FiArrowRight className="text-default-300 group-hover:text-warning-500 group-hover:translate-x-1 transition-all" size={18} />
                                </div>
                                {item.description ? (
                                    <p className="text-xs text-default-400 line-clamp-2 h-8 leading-relaxed italic">{item.description}</p>
                                ) : (
                                    <div className="h-8" />
                                )}
                            </div>

                            {counts && (
                                <div className="w-full pt-4 border-t border-foreground/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400">
                                        Collection
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-warning-500/10 text-[10px] font-bold text-warning-600">
                                        {count} Items
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
