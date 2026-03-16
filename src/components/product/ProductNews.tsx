"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Chip, Divider, Spinner } from "@nextui-org/react";
import { FiRss, FiArrowUpRight, FiClock } from "react-icons/fi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface NewsItem {
    title: string;
    link: string;
    summary: string;
    publishedAt: string | null;
    sourceName: string;
}

interface ProductNewsProps {
    query: string;
}

const ProductNews: React.FC<ProductNewsProps> = ({ query }) => {
    const [items, setItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.set("search", query);
                params.set("limit", "4");
                params.set("translate", "1");
                params.set("lang", "en");

                const res = await fetch(`/api/news?${params.toString()}`);
                const data = await res.json();

                if (data?.success && Array.isArray(data.data)) {
                    setItems(data.data);
                }
            } catch (err) {
                console.error("[ProductNews] Failed to load news:", err);
            } finally {
                setLoading(false);
            }
        }

        if (query) fetchNews();
    }, [query]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-default-400">
                <Spinner {...({ size: "sm", color: "warning" } as any)} />
                <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Scanning news feeds...</span>
            </div>
        );
    }

    if (items.length === 0) return null;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                    <FiRss className="text-danger-500" />
                    Related Trade News
                </h3>
                <Chip {...({ size: "sm", variant: "dot", color: "success" } as any)} className="text-[10px] font-bold uppercase">Live Feeds</Chip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                    <Card
                        key={item.link}
                        {...({
                            isPressable: true,
                            as: "a",
                            href: item.link,
                            target: "_blank",
                            className: "border-none bg-content2/40 hover:bg-content2/70 transition-all duration-300"
                        } as any)}
                    >
                        <CardBody className="p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black text-warning-600 uppercase tracking-widest truncate max-w-[60%]">
                                    {item.sourceName}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-default-400 shrink-0">
                                    <FiClock size={10} />
                                    {item.publishedAt ? dayjs(item.publishedAt).fromNow() : "Recently"}
                                </span>
                            </div>

                            <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2 min-h-[40px]">
                                {item.title}
                            </h4>

                            <p className="text-xs text-default-500 line-clamp-2 leading-relaxed">
                                {item.summary}
                            </p>

                            <div className="flex justify-end pt-1">
                                <FiArrowUpRight className="text-default-300 group-hover:text-warning-500 transition-colors" />
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProductNews;
