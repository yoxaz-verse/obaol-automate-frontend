
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
        <Card className="border-none shadow-sm bg-content1/50 backdrop-blur-lg hover:bg-content1 transition-colors">
            <CardBody className="gap-4 p-5">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <span className="text-default-500 text-xs font-semibold uppercase tracking-wider">{title}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-foreground">{metric}</span>
                            {trend && (
                                <Chip
                                    color={trend.isPositive ? "success" : "danger"}
                                    variant="flat"
                                    size="sm"
                                    classNames={{
                                        base: "h-5 px-1",
                                        content: "text-[10px] font-bold"
                                    }}
                                >
                                    {trend.value}
                                </Chip>
                            )}
                        </div>
                    </div>
                    {icon && (
                        <div className="p-2 bg-default-100 rounded-lg text-default-500">
                            {icon}
                        </div>
                    )}
                </div>

                {footer && <div className="pt-2">{footer}</div>}
            </CardBody>
        </Card>
    );
};

export default InsightCard;
