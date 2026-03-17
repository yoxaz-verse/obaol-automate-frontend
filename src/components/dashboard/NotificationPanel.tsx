"use client";

import React from "react";
import { Button, Chip, Spinner } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FiBell, FiCheckCircle, FiCircle, FiClock, FiExternalLink } from "react-icons/fi";
import { getData, patchData } from "@/core/api/apiHandler";
import { notificationRoutes } from "@/core/api/apiRoutes";
import { motion, useReducedMotion } from "framer-motion";
import { panelTransition } from "@/lib/motion/variants";

dayjs.extend(relativeTime);

type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  message: string;
  route: string;
  isRead: boolean;
  createdAt: string;
  priority?: "low" | "medium" | "high";
};

interface NotificationPanelProps {
  onClose?: () => void;
}

const getBucket = (createdAt: string) => {
  const dt = dayjs(createdAt);
  if (dt.isSame(dayjs(), "day")) return "Today";
  if (dt.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  return "Earlier";
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const reducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "panel"],
    queryFn: async () => {
      const res: any = await getData(notificationRoutes.list, { page: 1, limit: 20 });
      const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
      return rows as NotificationItem[];
    },
    refetchInterval: 25000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => patchData(notificationRoutes.readOne(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "panel"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => patchData(notificationRoutes.readAll, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "panel"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const notifications = data || [];
  const grouped = notifications.reduce<Record<string, NotificationItem[]>>((acc, n) => {
    const key = getBucket(n.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  const order = ["Today", "Yesterday", "Earlier"];

  const panelMotion = panelTransition(Boolean(reducedMotion));

  return (
    <motion.div
      initial={panelMotion.initial}
      animate={panelMotion.animate}
      exit={panelMotion.exit}
      transition={panelMotion.transition}
      className="w-[380px] max-w-[calc(100vw-24px)] rounded-2xl border border-default-200/80 bg-content1 shadow-2xl shadow-black/35 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-default-200/60">
        <div className="flex items-center gap-2">
          <FiBell className="text-warning-500" size={16} />
          <p className="text-sm font-black tracking-wide text-foreground">Notifications</p>
        </div>
        <Button
          size="sm"
          variant="light"
          className="text-xs font-semibold"
          isDisabled={markAllMutation.isPending || notifications.every((x) => x.isRead)}
          onPress={() => markAllMutation.mutate()}
        >
          Mark all read
        </Button>
      </div>

      <div className="max-h-[460px] overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="sm" color="warning" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-default-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {order.map((bucket) => {
              const items = grouped[bucket] || [];
              if (!items.length) return null;
              return (
                <div key={bucket} className="space-y-1.5">
                  <p className="px-2 text-[11px] font-black uppercase tracking-widest text-default-500">{bucket}</p>
                  {items.map((item) => (
                    <button
                      key={item._id}
                      onClick={async () => {
                        if (!item.isRead) {
                          await markReadMutation.mutateAsync(item._id);
                        }
                        if (item.route) {
                          router.push(item.route);
                          onClose?.();
                        }
                      }}
                      className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all duration-300 ${item.isRead
                        ? "border-default-200/50 bg-default-100/30 dark:bg-default-50/5 hover:bg-default-200/50 dark:hover:bg-default-100/10"
                        : "border-warning-500/30 bg-warning-500/5 dark:bg-warning-500/10 hover:bg-warning-500/10 dark:hover:bg-warning-500/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.1)]"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {item.isRead ? (
                              <FiCheckCircle size={12} className="text-default-400" />
                            ) : (
                              <FiCircle size={12} className="text-warning-500 fill-warning-500" />
                            )}
                            <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                          </div>
                          <p className="mt-1 text-xs text-default-600 line-clamp-2">{item.message}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Chip size="sm" variant="flat" className="text-[10px] font-semibold">
                              {item.type.replaceAll("_", " ")}
                            </Chip>
                            <span className="inline-flex items-center gap-1 text-[10px] text-default-500">
                              <FiClock size={10} />
                              {dayjs(item.createdAt).fromNow()}
                            </span>
                          </div>
                        </div>
                        <FiExternalLink size={14} className="text-default-400 mt-0.5 shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-3 py-2 border-t border-default-200/60">
        <Button
          size="sm"
          variant="light"
          className="text-xs font-semibold"
          onPress={() => {
            router.push("/dashboard/notifications");
            onClose?.();
          }}
        >
          View all notifications
        </Button>
        <Button size="sm" variant="flat" className="text-xs" onPress={onClose}>
          Close
        </Button>
      </div>
    </motion.div>
  );
};

export default NotificationPanel;
