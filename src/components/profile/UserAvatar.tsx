"use client";

import { Avatar } from "@nextui-org/react";
import { baseUrl } from "@/core/api/axiosInstance";

export const apiAssetUrl = (value?: string | null) => {
  if (!value) return undefined;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  const suffix = value.replace(/^\/api\/v1\/web/i, "").replace(/^\/v1\/web/i, "");
  return `${baseUrl.replace(/\/$/, "")}/${suffix.replace(/^\//, "")}`;
};

export const accountPictureUrl = (accountType: string, account: any) => account?.profilePicture?.objectKey
  ? `/v1/web/profile-pictures/${accountType}/${account._id}?v=${new Date(account.profilePicture.updatedAt || 0).getTime()}`
  : account?.profilePictureUrl;

type Props = {
  name?: string | null;
  src?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export default function UserAvatar({ name, src, className = "", size = "md" }: Props) {
  return (
    <Avatar
      showFallback
      name={name || "User"}
      src={apiAssetUrl(src)}
      size={size}
      className={`bg-gradient-to-br from-obaol-400 to-obaol-600 font-bold text-obaol-950 ${className}`}
      imgProps={{ referrerPolicy: "no-referrer" }}
    />
  );
}
