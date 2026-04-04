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
      className="w-[420px] max-w-[calc(100vw-24px)] rounded-[24px] border border-default-300 dark:border-white/10 bg-white/95 dark:bg-[#0B0F14]/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-black backdrop-blur-3xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-default-200/50 dark:border-white/5 bg-default-50/50 dark:bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-warning-500/10 flex items-center justify-center text-warning-500">
             <FiBell size={20} className={notifications.filter(n => !n.isRead).length > 0 ? "animate-wiggle" : ""} />
          </div>
          <div className="flex flex-col">
             <p className="text-sm font-black tracking-tight text-[#1F2937] dark:text-white uppercase leading-none">Command Hub</p>
             <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest mt-1">Operational Alerts</p>
          </div>
        </div>
        <button
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending || notifications.every((x) => x.isRead)}
          className="text-[11px] font-black uppercase tracking-wider text-warning-600 dark:text-warning-500 hover:opacity-70 transition-opacity disabled:opacity-30"
        >
          Finalize All
        </button>
      </div>

      <div className="max-h-[480px] overflow-y-auto custom-scrollbar p-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Spinner size="md" color="warning" />
            <span className="text-[10px] font-black text-default-400 uppercase tracking-[0.3em]">Syncing Protocols...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center opacity-40">
             <div className="w-16 h-16 rounded-full border-2 border-dashed border-default-300 flex items-center justify-center mb-4">
                <FiBell size={24} className="text-default-400" />
             </div>
             <p className="text-sm font-black text-default-500 uppercase tracking-widest">Sky clear</p>
          </div>
        ) : (
          <div className="space-y-6 px-1">
            {order.map((bucket) => {
              const items = grouped[bucket] || [];
              if (!items.length) return null;
              return (
                <div key={bucket} className="space-y-2">
                  <div className="flex items-center gap-3 px-2 mb-3">
                     <span className="text-[9px] font-black text-default-400 uppercase tracking-[0.25em] whitespace-nowrap">{bucket}</span>
                     <div className="flex-1 h-[1px] bg-gradient-to-r from-default-200 dark:from-white/5 to-transparent" />
                  </div>
                  {items.map((item) => (
                    <button
                      key={item._id}
                      onClick={async () => {
                        if (!item.isRead) await markReadMutation.mutateAsync(item._id);
                        if (item.route) { router.push(item.route); onClose?.(); }
                      }}
                      className={`w-full text-left p-4 rounded-[18px] transition-all duration-500 group relative border ${item.isRead
                        ? "bg-transparent border-transparent hover:bg-default-100/50 dark:hover:bg-white/5 text-default-500"
                        : "bg-warning-500/5 dark:bg-warning-500/10 border-warning-500/20 hover:border-warning-500/40 shadow-sm"
                        }`}
                    >
                      <div className="flex gap-4">
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 transition-all duration-500 ${item.isRead ? "bg-default-200" : "bg-warning-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse"}`} />
                        <div className="flex-1 min-w-0">
                           <p className={`text-sm font-black leading-snug tracking-tight transition-colors ${item.isRead ? "text-default-600" : "text-[#1F2937] dark:text-white"}`}>
                              {item.title}
                           </p>
                           <p className="mt-1.5 text-xs font-medium text-default-500 line-clamp-2 leading-relaxed italic">
                              {item.message}
                           </p>
                           <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-warning-600 dark:text-warning-500 uppercase tracking-widest bg-warning-500/10 px-2 py-0.5 rounded-full">
                                   {item.type.split('_').join(' ')}
                                </span>
                                <span className="text-[9px] font-black text-default-400 uppercase tracking-widest tabular-nums flex items-center gap-1">
                                   <FiClock size={10} className="stroke-[2.5px]" />
                                   {dayjs(item.createdAt).fromNow()}
                                </span>
                              </div>
                              <FiExternalLink size={14} className="text-default-300 group-hover:text-warning-500 group-hover:translate-x-0.5 transition-all" />
                           </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-6 py-5 border-t border-default-200/50 dark:border-white/5 flex items-center justify-between bg-default-50/30 dark:bg-black/20">
        <button
          onClick={() => { router.push("/dashboard/notifications"); onClose?.(); }}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F2937] dark:text-white hover:text-warning-500 transition-colors"
        >
          Access History Archive
        </button>
        <button 
           onClick={onClose}
           className="px-4 py-2 rounded-xl bg-default-100 dark:bg-white/10 text-[10px] font-black uppercase tracking-widest text-[#1F2937] dark:text-white hover:bg-default-200 dark:hover:bg-white/20 transition-all"
        >
           Close
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationPanel;
