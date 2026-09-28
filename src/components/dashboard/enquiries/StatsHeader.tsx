import React from "react";
import { Card, CardBody } from "@nextui-org/react";
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

    const toneByKey: Record<string, string> = {
        primary: "bg-primary-500/10 text-primary-500",
        warning: "bg-obaol-500/10 text-obaol-500",
        success: "bg-success-500/10 text-success-500",
        secondary: "bg-secondary-500/10 text-secondary-500",
    };

    const StatCard = ({ title, value, icon, color, subtext }: any) => (
        <Card className="border border-slate-200/90 dark:border-white/10 bg-content1 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <CardBody className="flex flex-row items-center justify-between p-4 px-5">
                <div className="min-w-0 flex-1">
                    <p className="text-default-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 truncate">
                        {title}
                    </p>
                    <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                        <h3 className="text-xl sm:text-2xl font-black text-foreground">{value}</h3>
                        {subtext && <span className="text-[10px] sm:text-xs text-success-600 dark:text-success-400 font-bold truncate">{subtext}</span>}
                    </div>
                </div>
                <div className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 ml-2 border border-slate-200/50 dark:border-white/10 ${toneByKey[color] || toneByKey.primary}`}>
                    {icon}
                </div>
            </CardBody>
        </Card>
    );

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
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
