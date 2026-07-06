"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiInbox } from "react-icons/fi";
import Link from "next/link";

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: React.ReactNode;
    action?: { label: string; href: string };
}

export default function EmptyState({
    title = "No Data Found",
    message = "There are no records to display at the moment.",
    icon = <FiInbox className="text-default-300" size={48} />,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center w-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1],
                }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 rounded-full bg-obaol-500/10 blur-3xl" />
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-background border border-default-200 shadow-sm"
                >
                    {icon}
                </motion.div>
            </motion.div>

            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-bold text-foreground mb-2"
            >
                {title}
            </motion.h3>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-default-500 max-w-[300px] leading-relaxed"
            >
                {message}
            </motion.p>
            {action && (
                <Link href={action.href} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-obaol-500 px-5 py-2.5 text-sm font-bold text-obaol-950 hover:bg-obaol-400">
                    {action.label}
                </Link>
            )}
        </div>
    );
}
