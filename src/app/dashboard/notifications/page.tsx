"use client";

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button, Chip, Spinner } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FiBell, FiCheckCircle, FiCircle, FiClock, FiExternalLink } from "react-icons/fi";
import { getData, patchData } from "@/core/api/apiHandler";
import { notificationRoutes } from "@/core/api/apiRoutes";

dayjs.extend(relativeTime);

type NotificationRow = {
  _id: string;
  type: string;
  title: string;
  message: string;
  route: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationMeta = {
  page: number;
  limit: number;
  pages: number;
  total: number;
};

const NotificationsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const limit = 25;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["notifications", "page", page, unreadOnly],
    queryFn: async () => {
      const res: any = await getData(notificationRoutes.list, { page, limit, unreadOnly });
      return {
        rows: (res?.data?.data || []) as NotificationRow[],
        meta: (res?.meta || { page, limit, pages: 1, total: 0 }) as NotificationMeta,
      };
    },
    refetchInterval: 25000,
  });

  const rows = data?.rows || [];
  const meta = data?.meta || { page, limit, pages: 1, total: 0 };

  useEffect(() => {
    patchData(notificationRoutes.markSectionRead("notifications"), {}).catch(() => {});
  }, []);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => patchData(notificationRoutes.readOne(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => patchData(notificationRoutes.readAll, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const canMarkAll = useMemo(() => rows.some((x) => !x.isRead), [rows]);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-default-200 bg-content1 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-default-500">
              Role-scoped updates for enquiries, orders, and live catalog events.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={unreadOnly ? "solid" : "flat"}
              color={unreadOnly ? "warning" : "default"}
              onPress={() => {
                setPage(1);
                setUnreadOnly((prev) => !prev);
              }}
            >
              {unreadOnly ? "Showing unread only" : "Show unread only"}
            </Button>
            <Button
              size="sm"
              variant="flat"
              onPress={() => markAllMutation.mutate()}
              isDisabled={!canMarkAll || markAllMutation.isPending}
            >
              Mark all read
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-default-200 bg-content1 p-3 md:p-4">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner color="warning" size="sm" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm font-semibold text-default-500">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((item) => (
              <div
                key={item._id}
                className={`rounded-xl border px-3 py-3 md:px-4 md:py-3.5 ${item.isRead ? "border-default-200/70 bg-content1" : "border-warning-400/40 bg-warning-500/10"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {item.isRead ? (
                        <FiCheckCircle size={12} className="text-default-400" />
                      ) : (
                        <FiCircle size={12} className="text-warning-500 fill-warning-500" />
                      )}
                      <p className="text-sm md:text-base font-bold text-foreground truncate">{item.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-default-600">{item.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Chip size="sm" variant="flat" className="text-[10px] font-semibold">
                        {item.type.replaceAll("_", " ")}
                      </Chip>
                      <span className="inline-flex items-center gap-1 text-[11px] text-default-500">
                        <FiClock size={10} />
                        {dayjs(item.createdAt).fromNow()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!item.isRead && (
                      <Button
                        size="sm"
                        variant="light"
                        isLoading={markReadMutation.isPending}
                        onPress={() => markReadMutation.mutate(item._id)}
                      >
                        Mark read
                      </Button>
                    )}
                    {item.route && (
                      <Button
                        size="sm"
                        color="warning"
                        variant="flat"
                        startContent={<FiExternalLink size={12} />}
                        onPress={async () => {
                          if (!item.isRead) {
                            await markReadMutation.mutateAsync(item._id);
                          }
                          router.push(item.route);
                        }}
                      >
                        Open
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-default-200 bg-content1 px-4 py-3">
        <div className="inline-flex items-center gap-2 text-sm text-default-500">
          <FiBell size={14} />
          {isFetching ? "Refreshing..." : `Total ${meta.total} notifications`}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="flat" isDisabled={page <= 1} onPress={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-default-500">
            Page {meta.page} / {meta.pages}
          </span>
          <Button
            size="sm"
            variant="flat"
            isDisabled={page >= meta.pages}
            onPress={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NotificationsPage;
