export const formatDocumentNumber = (value: unknown, currency = "INR") => new Intl.NumberFormat(
  String(currency).toUpperCase() === "INR" ? "en-IN" : "en-US",
  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
).format(Number(value || 0));

export const formatDocumentMoney = (value: unknown, currency = "INR") => `${String(currency || "INR").toUpperCase()} ${formatDocumentNumber(value, currency)}`;
