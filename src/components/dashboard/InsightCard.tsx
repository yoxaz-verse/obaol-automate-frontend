
import React from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";

interface InsightCardProps {
    title: string;
    metric: string | number;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    icon?: React.ReactNode;
    footer?: React.ReactNode;
}

const InsightCard: React.FC<InsightCardProps> = ({ title, metric, trend, icon, footer }) => {
    return (
        <Card className="dashboard-panel shadow-none transition-colors hover:border-obaol-500/30">
            <CardBody className="gap-3.5 p-5">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <span className="text-default-500 text-[11px] font-bold uppercase tracking-wider">{title}</span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-3xl font-black tracking-tight text-foreground">{metric}</span>
                            {trend && (
                                <Chip
                                    color={trend.isPositive ? "success" : "danger"}
                                    variant="flat"
                                    size="sm"
                                    classNames={{
                                        base: "h-5 px-1.5 rounded-lg",
                                        content: "text-[10px] font-bold"
                                    }}
                                >
                                    {trend.value}
                                </Chip>
                            )}
                        </div>
                    </div>
                    {icon && (
                        <div className="p-2.5 bg-obaol-500/10 text-obaol-600 dark:text-obaol-400 rounded-xl border border-obaol-500/20 shrink-0">
                            {icon}
                        </div>
                    )}
                </div>

                {footer && <div className="pt-2 border-t border-default-100 dark:border-white/5">{footer}</div>}
            </CardBody>
        </Card>
    );
};

export default InsightCard;
