const enabled = (value: unknown) => String(value || "").trim().toLowerCase() === "true";

export const featureFlags = {
  associateWhatsappIntegration: enabled(process.env.NEXT_PUBLIC_ASSOCIATE_WHATSAPP_ENABLED),
};
