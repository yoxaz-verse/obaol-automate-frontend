export const warehouseWhatsAppMessage = (warehouseName: string) =>
  `Hello, I found ${String(warehouseName || "this warehouse").trim() || "this warehouse"} on OBAOL and would like to enquire about its facilities and availability.`;

export const normalizeWhatsAppNumber = (value?: string) => {
  const raw = String(value || "").trim();
  if (!/^\+[1-9]\d{7,14}$/.test(raw)) return "";
  return raw.slice(1);
};

export const warehouseWhatsAppHref = (warehouseName: string, whatsappPhone?: string) => {
  const digits = normalizeWhatsAppNumber(whatsappPhone);
  if (!digits) return undefined;
  return `https://wa.me/${digits}?text=${encodeURIComponent(warehouseWhatsAppMessage(warehouseName))}`;
};
