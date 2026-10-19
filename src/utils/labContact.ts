import { postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

export type LabContactChannel = "PHONE" | "WHATSAPP" | "EMAIL";

export const trackLabContact = (labId: string, channel: LabContactChannel) => {
  if (!labId || labId.startsWith("legacy-")) return;
  void postData(apiRoutes.labProfiles.contact(labId), { channel }).catch(() => undefined);
};
