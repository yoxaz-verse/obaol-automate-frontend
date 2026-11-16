import { postData } from "@/core/api/apiHandler";
import { freightForwardingRoutes } from "@/core/api/apiRoutes";
export const trackFreightContact = (id: string, channel: "PHONE" | "EMAIL" | "WHATSAPP" | "WEBSITE") => { void postData(freightForwardingRoutes.directoryContact(id), { channel }).catch(() => undefined); };
