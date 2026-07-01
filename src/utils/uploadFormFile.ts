import { postMultipart } from "@/core/api/apiHandler";
import { baseUrl } from "@/core/api/axiosInstance";

export type UploadedFormFile = { fileId: string; fileURL: string };

export const uploadFormFile = async (file: File, metadata: Record<string, unknown> = {}): Promise<UploadedFormFile> => {
  const body = new FormData();
  body.append("file", file);
  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.append(key, typeof value === "string" ? value : JSON.stringify(value));
  });

  const response: any = await postMultipart(`${baseUrl}/upload`, body);
  const payload = response?.data?.data || response?.data || {};
  const fileId = String(payload?.fileIds?.[0] || payload?.fileId || payload?._id || "");
  const fileURL = String(payload?.fileURLs?.[0] || payload?.fileURL || payload?.url || "");
  if (!fileId && !fileURL) throw new Error("The upload completed without a file reference.");
  return { fileId, fileURL };
};
