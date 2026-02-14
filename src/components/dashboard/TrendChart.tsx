
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Card, CardBody, CardHeader } from "@nextui-org/react";

interface TrendChartProps {
    title: string;
    data: any[];
    dataKey: string;
    categoryKey?: string;
    color?: string;
    type?: 'line' | 'area';
    height?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({
    title,
    data,
    dataKey,
    categoryKey = "name",
    color = "#8884d8",
    type = 'area',
    height = 300
}) => {
    return (
        <Card className="border-none shadow-sm bg-content1/50 backdrop-blur-lg h-full">
            <CardHeader className="px-6 py-4 border-b border-default-100">
                <h4 className="font-semibold text-foreground/90">{title}</h4>
            </CardHeader>
            <CardBody className="p-4">
                <div style={{ width: '100%', height: height }}>
                    <ResponsiveContainer>
                        {type === 'line' ? (
                            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--nextui-default-200))" />
                                <XAxis
                                    dataKey={categoryKey}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--nextui-default-500))', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--nextui-default-500))', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                        backgroundColor: 'hsl(var(--nextui-content1))'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke={color}
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: color, strokeWidth: 2, stroke: 'white' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        ) : (
                            <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <defs>
                                    <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--nextui-default-200))" />
                                <XAxis
                                    dataKey={categoryKey}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--nextui-default-500))', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--nextui-default-500))', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                        backgroundColor: 'hsl(var(--nextui-content1))'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke={color}
                                    fillOpacity={1}
                                    fill={`url(#color${dataKey})`}
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </CardBody>
        </Card>
    );
};

export default TrendChart;
