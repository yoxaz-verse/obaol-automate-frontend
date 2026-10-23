type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const idOf = (value: unknown): string => {
  const record = asRecord(value);
  return String(record._id ?? value ?? "");
};

export type OrderActorContext = {
  role: string;
  userId: string;
  buyerId: string;
  sellerId: string;
};

export const buildOrderActorContext = (user: unknown, enquiry: unknown): OrderActorContext => {
  const actor = asRecord(user);
  const participants = asRecord(enquiry);
  return {
    role: String(actor.role ?? "").toLowerCase(),
    userId: String(actor.id ?? actor._id ?? ""),
    buyerId: idOf(participants.buyerAssociateId),
    sellerId: idOf(participants.sellerAssociateId),
  };
};

export const isInternalOrderActor = ({ role }: OrderActorContext): boolean =>
  role === "admin" || role === "operator" || role === "team";

export const canViewOrderRule = (rule: unknown, actor: OrderActorContext): boolean => {
  if (isInternalOrderActor(actor)) return true;
  const visibility = String(asRecord(rule).visibility ?? "BOTH").toUpperCase();
  if (visibility === "INTERNAL") return false;
  if (visibility === "BOTH") return true;
  if (visibility === "BUYER") return actor.buyerId === actor.userId;
  if (visibility === "SELLER") return actor.sellerId === actor.userId;
  return false;
};

export const canActOnOrderRule = (rule: unknown, actor: OrderActorContext): boolean => {
  if (isInternalOrderActor(actor)) return true;
  const responsibleRole = String(asRecord(rule).responsibleRole ?? "").toUpperCase();
  if (responsibleRole === "BUYER") return actor.buyerId === actor.userId;
  if (responsibleRole === "SELLER") return actor.sellerId === actor.userId;
  return false;
};

const responsibilityKeyBySubflow: Record<string, string> = {
  PROCUREMENT: "procurementBy",
  PACKAGING: "packagingBy",
  INLAND_TRANSPORTATION: "transportBy",
  CERTIFICATION: "certificateBy",
  FREIGHT_FORWARDING: "shippingBy",
  QUALITY_QA: "qualityTestingBy",
};

export const canEditOrderSubflow = (
  subflowType: string,
  responsibilities: unknown,
  actor: OrderActorContext,
): boolean => {
  if (isInternalOrderActor(actor)) return true;
  const key = responsibilityKeyBySubflow[String(subflowType || "").toUpperCase()];
  if (!key) return false;
  const owner = String(asRecord(responsibilities)[key] ?? "obaol").toLowerCase();
  if (owner === "buyer") return actor.buyerId === actor.userId;
  if (owner === "seller") return actor.sellerId === actor.userId;
  return false;
};

export const canViewOrderFleet = (
  subflowTypes: readonly unknown[],
  responsibilities: unknown,
  actor: OrderActorContext,
): boolean => subflowTypes.some((type) => String(type).toUpperCase() === "INLAND_TRANSPORTATION")
  && canEditOrderSubflow("INLAND_TRANSPORTATION", responsibilities, actor);
