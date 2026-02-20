import React from "react";
import { Card, CardBody } from "@heroui/react";
import { FiInbox, FiActivity, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface StatsHeaderProps {
    data: any[];
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ data }) => {
    const total = data.length;
    const getStatusName = (item: any) => {
        if (!item.status) return "New";
        if (typeof item.status === "string") return item.status;
        return item.status.name || "New";
    };

    const active = data.filter((item) =>
        !["Completed", "Rejected", "Cancelled"].includes(getStatusName(item))
    ).length;
    const completed = data.filter((item) => getStatusName(item) === "Completed").length;
    const newEnquiries = data.filter((item) => getStatusName(item) === "Pending" || getStatusName(item) === "New").length;

    // Conversion Rate: Completed / Total
    const conversionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0";

    const StatCard = ({ title, value, icon, color, subtext }: any) => (
        <Card className="border-none bg-content1 shadow-sm custom-shadow rounded-xl">
            <CardBody className="flex flex-row items-center justify-between p-4 px-5">
                <div>
                    <p className="text-default-500 text-xs font-semibold uppercase tracking-wider mb-1">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                        {subtext && <span className="text-xs text-success-500 font-medium">{subtext}</span>}
                    </div>
                </div>
                <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
                    {icon}
                </div>
            </CardBody>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
                title="Total Enquiries"
                value={total}
                icon={<FiInbox size={22} />}
                color="primary"
            />
            <StatCard
                title="Active / Pending"
                value={active}
                icon={<FiActivity size={22} />}
                color="warning"
                subtext={`${newEnquiries} New`}
            />
            <StatCard
                title="Completed"
                value={completed}
                icon={<FiCheckCircle size={22} />}
                color="success"
            />
            <StatCard
                title="Conversion Rate"
                value={`${conversionRate}%`}
                icon={<FiAlertCircle size={22} />}
                color="secondary"
            />
        </div>
    );
};

export default StatsHeader;
