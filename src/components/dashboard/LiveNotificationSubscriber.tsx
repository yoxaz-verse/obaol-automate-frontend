"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "@/core/api/axiosInstance";
import { notificationRoutes } from "@/core/api/apiRoutes";

type LiveNotification = {
  _id: string;
  route?: string;
  type?: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  [key: string]: unknown;
};

const streamUrl = () => `${String(baseUrl).replace(/\/+$/, "")}${notificationRoutes.stream}`;

export default function LiveNotificationSubscriber({ userId }: { userId?: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const desktopNotificationIds = useRef(new Set<string>());

  useEffect(() => {
    if (!userId) return;
    if (window.obaolDesktop && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
    const source = new EventSource(streamUrl(), { withCredentials: true });

    const handleNotification = (event: MessageEvent<string>) => {
      try {
        const notification = JSON.parse(event.data) as LiveNotification;
        if (!notification?._id) return;

        if (
          window.obaolDesktop
          && "Notification" in window
          && Notification.permission === "granted"
          && !desktopNotificationIds.current.has(notification._id)
        ) {
          desktopNotificationIds.current.add(notification._id);
          if (desktopNotificationIds.current.size > 200) {
            const oldestId = desktopNotificationIds.current.values().next().value;
            if (oldestId) desktopNotificationIds.current.delete(oldestId);
          }
          const desktopNotification = new Notification(notification.title || "OBAOL Supreme", {
            body: notification.message || "You have a new workspace update.",
            icon: "/pwa/icon-192.png",
            tag: notification._id,
          });
          desktopNotification.onclick = () => {
            window.obaolDesktop?.focusWindow();
            if (notification.route?.startsWith("/")) router.push(notification.route);
            desktopNotification.close();
          };
        }

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
  }, [queryClient, router, userId]);

  return null;
}
