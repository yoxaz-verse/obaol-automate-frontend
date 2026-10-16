"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "@/core/api/axiosInstance";
import { notificationRoutes } from "@/core/api/apiRoutes";

type LiveNotification = {
  _id: string;
  route?: string;
  type?: string;
  isRead?: boolean;
  [key: string]: unknown;
};

const streamUrl = () => `${String(baseUrl).replace(/\/+$/, "")}${notificationRoutes.stream}`;

export default function LiveNotificationSubscriber({ userId }: { userId?: string }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const source = new EventSource(streamUrl(), { withCredentials: true });

    const handleNotification = (event: MessageEvent<string>) => {
      try {
        const notification = JSON.parse(event.data) as LiveNotification;
        if (!notification?._id) return;

        queryClient.setQueryData<LiveNotification[]>(["notifications", "panel"], (current = []) => {
          if (current.some((item) => item._id === notification._id)) return current;
          return [notification, ...current].slice(0, 20);
        });
        queryClient.setQueryData<number>(["notifications", "unread-count"], (current = 0) => current + 1);
        queryClient.setQueryData<Record<string, number>>(["notifications", "unread-summary"], (current = {}) => ({
          ...current,
          enquiries: Number(current.enquiries || 0) + (String(notification.route || "").startsWith("/dashboard/enquiries") ? 1 : 0),
        }));
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      } catch {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    };

    source.addEventListener("notification", handleNotification as EventListener);
    return () => {
      source.removeEventListener("notification", handleNotification as EventListener);
      source.close();
    };
  }, [queryClient, userId]);

  return null;
}
