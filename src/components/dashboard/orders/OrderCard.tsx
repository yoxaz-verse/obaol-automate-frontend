import React from "react";
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
import { LuAward, LuBox, LuBriefcase, LuCalendar, LuPhone, LuShield, LuTruck } from "react-icons/lu";
import { motion } from "framer-motion";
import AuthContext from "@/context/AuthContext";
import { classificationBadgeClass, classificationIcon, getClassificationBadges } from "@/utils/classificationTheme";
import OrderStatus from "./OrderStatus";

interface OrderCardProps {
    data: any;
    action?: React.ReactNode;
    onCardClick?: () => void;
}

const ownerLabelMap: Record<string, string> = { buyer: "Buyer", seller: "Supplier", obaol: "OBAOL Team" };

const workstreams = [
    { key: "procurementBy", label: "Procure", Icon: LuShield },
    { key: "certificateBy", label: "Certify", Icon: LuAward },
    { key: "transportBy", label: "Logistics", Icon: LuTruck },
    { key: "packagingBy", label: "Package", Icon: LuBox },
];

const OrderCard: React.FC<OrderCardProps> = ({ data, action, onCardClick }) => {
    const { user } = React.useContext(AuthContext);
    const roleLower = String(user?.role || "").toLowerCase();
    const isOperator = roleLower === "admin" || roleLower === "operator" || roleLower === "team";
    const isExternal = Boolean(data.isExternal);

    const product =
        (isExternal && data.externalProduct?.name) ||
        data.enquiry?.variantRateId?.productVariant?.product?.name ||
        data.enquiry?.productVariant?.product?.name ||
        data.enquiry?.productId?.name ||
        data.enquiry?.product?.name ||
        data.productVariant?.product?.name ||
        data.product?.name ||
        "Product";
    const variant =
        (isExternal && data.externalProduct?.variant) ||
        data.enquiry?.variantRateId?.productVariant?.name ||
        data.enquiry?.productVariant?.name ||
        data.productVariant?.name ||
        data.enquiry?.variantName ||
        data.variantName ||
        "Variant";
    const classificationBadges = getClassificationBadges(data?.enquiry?.variantRateId || data?.variantRateId || null);

    const buyerName = data.enquiry?.buyerAssociateId?.name || data.enquiry?.buyerName || data.externalBuyer?.name || "Buyer";
    const sellerName = data.enquiry?.sellerAssociateId?.name || data.enquiry?.sellerName || data.externalSeller?.name || "Supplier";
    const buyerCompany = data.enquiry?.buyerAssociateId?.associateCompany?.name || data.enquiry?.buyerAssociateCompanyName || "Direct Buyer";
    const sellerCompany = data.enquiry?.sellerAssociateId?.associateCompany?.name || data.enquiry?.sellerAssociateCompanyName || "Direct Supplier";
    const isBuying = String(data.enquiry?.buyerAssociateId?._id || data.enquiry?.buyerAssociateId) === String(user?.id);

    const date = data.createdAt
        ? new Date(data.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
        : "Recent";
    const status = data.status || "Procuring";
    const normalizedStatus = String(status).toLowerCase();
    const isCompleted = normalizedStatus.includes("complete");
    const isCancelled = normalizedStatus.includes("cancel");
    const isTransit = normalizedStatus.includes("transit") || normalizedStatus.includes("loaded");
    const isNew = data.createdAt ? Date.now() - new Date(data.createdAt).getTime() < 86400000 : false;
    const responsibilityCount = workstreams.filter(({ key }) => Boolean(data.responsibilities?.[key])).length;

    const accentClass = isCancelled ? "bg-danger-500" : isCompleted ? "bg-success-500" : "bg-warning-500";
    const borderClass = isCancelled
        ? "border-danger-200/80 hover:border-danger-400/70"
        : isCompleted
            ? "border-success-200/80 hover:border-success-400/70"
            : isTransit
                ? "border-warning-300/80 hover:border-warning-400"
                : "border-default-200 hover:border-warning-300";

    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => onCardClick?.()}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onCardClick?.();
                }
            }}
        >
            <Card className={`group relative h-full overflow-hidden rounded-[1.5rem] border bg-content1 shadow-sm transition-all duration-200 hover:shadow-lg ${borderClass}`}>
                <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} aria-hidden="true" />

                <CardHeader className="flex flex-col items-start gap-3 px-4 pb-2 pt-5 sm:px-5">
                    <div className="flex w-full items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex items-center gap-2">
                                <span className="max-w-full truncate rounded-md border border-default-200 bg-default-100/70 px-2 py-1 text-[10px] font-semibold leading-none text-default-600">
                                    {variant}
                                </span>
                                {isNew && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success-600">
                                        <span className="h-1.5 w-1.5 rounded-full bg-success-500" /> New
                                    </span>
                                )}
                            </div>
                            <h4 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-warning-600">
                                {product}
                            </h4>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-default-200 bg-content2/70 px-2.5 py-1.5 text-default-600">
                            <LuCalendar size={13} className="text-warning-600" aria-hidden="true" />
                            <span className="text-[11px] font-semibold leading-none">{date}</span>
                        </div>
                    </div>

                    {classificationBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {classificationBadges.map((badge) => (
                                <span key={badge.key} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold leading-none ${classificationBadgeClass(badge.key)}`}>
                                    {React.createElement(classificationIcon(badge.key), { size: 10 })}
                                    {badge.label}
                                </span>
                            ))}
                        </div>
                    )}
                </CardHeader>

                <CardBody className="flex flex-col gap-4 px-4 py-3 sm:px-5">
                    {isOperator ? (
                        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-default-200 bg-default-100/50 p-2.5">
                            {[
                                { label: "Buyer", name: buyerName, initial: "B", tone: "bg-primary/10 text-primary border-primary/20" },
                                { label: "Supplier", name: sellerName, initial: "S", tone: "bg-warning-500/10 text-warning-700 border-warning-500/20" },
                            ].map((party) => (
                                <div key={party.label} className="flex min-w-0 items-center gap-2.5 rounded-xl bg-content1/70 p-2">
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${party.tone}`}>{party.initial}</div>
                                    <div className="min-w-0">
                                        <p className="mb-0.5 text-[10px] font-semibold leading-none text-default-500">{party.label}</p>
                                        <p className="line-clamp-2 text-xs font-bold leading-tight text-foreground" title={party.name}>{party.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-2xl border border-default-200 bg-default-100/50 p-3">
                            <Avatar radius="lg" size="sm" name={(isBuying ? sellerName : buyerName)[0]} className={`${isBuying ? "bg-warning-500/10 text-warning-700" : "bg-primary/10 text-primary"} shrink-0 border border-default-200 font-bold`} />
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-default-500">Counterparty</p>
                                <p className="line-clamp-2 text-xs font-bold leading-tight text-foreground">{isBuying ? sellerName : buyerName}</p>
                                <p className="mt-0.5 truncate text-[10px] font-medium text-default-500">{isBuying ? sellerCompany : buyerCompany}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground text-background">
                                    <LuBriefcase size={12} aria-hidden="true" />
                                </div>
                                <span className="text-xs font-bold text-foreground">Execution</span>
                            </div>
                            <span className="rounded-full border border-default-200 bg-default-100 px-2 py-1 text-[10px] font-semibold leading-none text-default-600">{responsibilityCount}/4 assigned</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {workstreams.map(({ key, label, Icon }) => {
                                const owner = data.responsibilities?.[key];
                                const ownerLabel = owner ? ownerLabelMap[owner] || owner : "Unassigned";
                                return (
                                    <div key={key} className="min-w-0 rounded-xl border border-default-200 bg-content2/40 p-2.5">
                                        <div className="mb-1.5 flex items-center gap-1.5 text-default-500">
                                            <Icon size={12} aria-hidden="true" />
                                            <span className="text-[10px] font-semibold leading-none">{label}</span>
                                        </div>
                                        <div className="flex min-w-0 items-center gap-1.5">
                                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${owner ? "bg-success-500" : "bg-default-300"}`} />
                                            <span className={`truncate text-[11px] font-bold ${owner ? "text-foreground" : "text-default-400"}`} title={ownerLabel}>{ownerLabel}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardBody>

                <CardFooter className="mt-auto flex flex-col gap-3 border-t border-default-200 bg-default-100/40 px-4 py-4 sm:px-5">
                    <OrderStatus status={status} />
                    <div className="flex h-10 w-full items-center gap-2.5">
                        {isOperator && (
                            <Button isIconOnly variant="bordered" aria-label="Contact order participant" className="h-10 w-10 min-w-10 shrink-0 rounded-xl border-default-300 text-default-600 transition-colors hover:border-warning-400 hover:bg-warning-50 hover:text-warning-700" onClick={(event) => event.stopPropagation()}>
                                <LuPhone size={16} aria-hidden="true" />
                            </Button>
                        )}
                        <div className="flex min-w-0 flex-1 justify-end" onClick={(event) => event.stopPropagation()}>{action}</div>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default OrderCard;
