"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button, Card, CardBody, CardHeader, Chip, Divider, Input, Select, SelectItem, Spinner, Textarea } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LuBell, 
  LuCheck, 
  LuClock, 
  LuExternalLink, 
  LuSend, 
  LuInbox, 
  LuInfo, 
  LuChevronLeft, 
  LuChevronRight,
  LuLayoutGrid,
  LuShieldCheck
} from "react-icons/lu";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes, notificationRoutes } from "@/core/api/apiRoutes";
import AuthContext from "@/context/AuthContext";
import { extractList } from "@/core/data/queryUtils";
import { showToastMessage } from "@/utils/utils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const SectionHeader = ({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon: any }) => (
  <div className="flex flex-col gap-1 mb-6">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
        <Icon size={20} />
      </div>
      <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">{title}</h2>
    </div>
    {subtitle && <p className="text-[10px] font-black uppercase tracking-[0.4em] text-default-400 leading-none ml-[52px]">{subtitle}</p>}
  </div>
);

const NotificationsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const limit = 25;
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastPriority, setBroadcastPriority] = useState<string>("medium");
  const [broadcastRoles, setBroadcastRoles] = useState<Set<string>>(new Set());
  const [broadcastFunctions, setBroadcastFunctions] = useState<Set<string>>(new Set());

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["notifications", "page", page, unreadOnly],
    queryFn: async () => {
      const res: any = await getData(notificationRoutes.list, { page, limit, unreadOnly });
      return {
        rows: (res?.data?.data || []) as NotificationRow[],
        meta: (res?.meta || { page, limit, pages: 1, total: 0 }) as NotificationMeta,
      };
    },
    refetchInterval: 30000,
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

  const functionQuery = useQuery({
    queryKey: ["notification-broadcast-functions"],
    queryFn: () => getData(apiRoutes.companyFunction.getAll, { page: 1, limit: 200, sort: "orderIndex:asc" }),
    enabled: isAdmin,
  });
  const companyFunctions = extractList(functionQuery.data);

  const broadcastMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        priority: broadcastPriority,
        roles: Array.from(broadcastRoles),
        companyFunctionIds: Array.from(broadcastFunctions),
      };
      return postData(notificationRoutes.broadcast, payload);
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Broadcast sent successfully." });
      setBroadcastTitle("");
      setBroadcastMessage("");
      setBroadcastPriority("medium");
      setBroadcastRoles(new Set());
      setBroadcastFunctions(new Set());
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-summary"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to send broadcast.";
      showToastMessage({ type: "error", message: msg });
    },
  });

  const handleBroadcastSubmit = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToastMessage({ type: "warning", message: "Title and message are required." });
      return;
    }
    broadcastMutation.mutate();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
      {isAdmin && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
          <Card className="border border-default-200/50 bg-content1/70 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] rounded-[3rem] overflow-hidden">
            <CardHeader className="px-10 pt-10 pb-2 flex flex-col items-start border-none">
                <SectionHeader 
                    title="General Message" 
                    subtitle="Universal System Node Broadcast" 
                    icon={LuSend} 
                />
            </CardHeader>
            <Divider className="mx-10 w-auto bg-default-200/40" />
            <CardBody className="px-10 py-8 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
                <div className="space-y-10">
                    <Input
                        label="Broadcast Title"
                        labelPlacement="outside"
                        placeholder="Enter urgent update subject..."
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        isRequired
                        classNames={{
                            inputWrapper: "bg-content2/30 border-default-200/60 rounded-[1.5rem] h-14 shadow-inner px-6",
                            label: "text-[10px] font-black uppercase tracking-widest text-default-400 mb-2 ml-2",
                            input: "text-sm font-black uppercase tracking-tight placeholder:text-default-300",
                        }}
                    />
                    <Select
                        label="Priority Matrix"
                        labelPlacement="outside"
                        selectedKeys={new Set([broadcastPriority])}
                        onSelectionChange={(keys) => {
                            const next = Array.from(keys as Set<string>)[0] || "medium";
                            setBroadcastPriority(String(next));
                        }}
                        classNames={{
                            trigger: "bg-content2/30 border-default-200/60 rounded-[1.5rem] h-14 shadow-inner px-6",
                            label: "text-[10px] font-black uppercase tracking-widest text-default-400 mb-2 ml-2",
                            value: "text-sm font-black uppercase tracking-tight",
                        }}
                    >
                        <SelectItem key="low" startContent={<div className="h-2 w-2 rounded-full bg-success" />}>LOW LATENCY</SelectItem>
                        <SelectItem key="medium" startContent={<div className="h-2 w-2 rounded-full bg-warning" />}>MEDIUM PRIORITY</SelectItem>
                        <SelectItem key="high" startContent={<div className="h-2 w-2 rounded-full bg-danger animate-pulse" />}>URGENT UPLINK</SelectItem>
                    </Select>
                </div>
                
                <Textarea
                    label="Message Protocol"
                    labelPlacement="outside"
                    placeholder="Describe the system update or operational requirement..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    minRows={6}
                    isRequired
                    classNames={{
                        inputWrapper: "bg-content2/30 border-default-200/60 rounded-[2rem] shadow-inner px-6 py-4",
                        label: "text-[10px] font-black uppercase tracking-widest text-default-400 mb-2 ml-2",
                        input: "text-sm font-medium leading-relaxed placeholder:text-default-300",
                    }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
                <Select
                  label="Target Roles"
                  labelPlacement="outside"
                  selectionMode="multiple"
                  placeholder="Universal Target (All Roles)"
                  selectedKeys={broadcastRoles}
                  onSelectionChange={(keys) => {
                    setBroadcastRoles(new Set(Array.from(keys as Set<string>).map(String)));
                  }}
                  classNames={{
                    trigger: "bg-content2/30 border-default-200/60 rounded-[1.5rem] h-14 shadow-inner px-6",
                    label: "text-[10px] font-black uppercase tracking-widest text-default-400 mb-2 ml-2",
                    value: "text-xs font-black uppercase tracking-widest",
                  }}
                >
                  <SelectItem key="Admin">ADMINISTRATOR</SelectItem>
                  <SelectItem key="Associate">ASSOCIATE</SelectItem>
                  <SelectItem key="Operator">SYSTEM OPERATOR</SelectItem>
                </Select>
                <Select
                  label="Node Functions"
                  labelPlacement="outside"
                  selectionMode="multiple"
                  placeholder="Global Cluster (All Functions)"
                  selectedKeys={broadcastFunctions}
                  onSelectionChange={(keys) => {
                    setBroadcastFunctions(new Set(Array.from(keys as Set<string>).map(String)));
                  }}
                  isDisabled={functionQuery.isLoading}
                  classNames={{
                    trigger: "bg-content2/30 border-default-200/60 rounded-[1.5rem] h-14 shadow-inner px-6",
                    label: "text-[10px] font-black uppercase tracking-widest text-default-400 mb-2 ml-2",
                    value: "text-xs font-black uppercase tracking-widest",
                  }}
                >
                  {companyFunctions.map((fn: any) => (
                    <SelectItem key={String(fn._id)} textValue={String(fn.name || "")}>
                      {String(fn.name || "").toUpperCase()}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-[2rem] bg-default-100/50 border border-dashed border-default-200/60">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-content1 flex items-center justify-center text-default-400 shadow-md">
                    <LuInfo size={18} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400 max-w-sm leading-relaxed">
                    Leaving targets empty defaults to global broadcast scope. This action is irreversible once initialized.
                  </p>
                </div>
                <Button
                  color="primary"
                  className="h-14 px-12 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                  onPress={handleBroadcastSubmit}
                  isLoading={broadcastMutation.isPending}
                  startContent={<LuSend size={16} />}
                >
                  Execute Broadcast
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <SectionHeader 
            title="Telemetry Inbox" 
            subtitle="Scoped Operations & Status Logs" 
            icon={LuBell} 
          />
          <div className="flex items-center gap-3 p-2 bg-content1/50 backdrop-blur-xl border border-default-200/50 rounded-2xl">
            <Button
                size="sm"
                variant={unreadOnly ? "shadow" : "flat"}
                color={unreadOnly ? "primary" : "default"}
                className={`h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest ${!unreadOnly ? 'text-default-500' : ''}`}
                onPress={() => {
                    setPage(1);
                    setUnreadOnly((prev) => !prev);
                }}
            >
                {unreadOnly ? "Unread Only Active" : "Filter Unread"}
            </Button>
            <div className="h-6 w-[1px] bg-default-200/50" />
            <Button
                size="sm"
                variant="flat"
                className="h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-default-500 hover:text-foreground transition-colors"
                onPress={() => markAllMutation.mutate()}
                isDisabled={!canMarkAll || markAllMutation.isPending}
                startContent={<LuCheck size={14} />}
            >
                Mark All read
            </Button>
          </div>
        </div>

        <Card className="border border-default-200/50 bg-content1/40 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden">
          <CardBody className="p-4 md:p-8">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-6">
                <Spinner color="primary" size="lg" className="scale-150" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-default-400 animate-pulse">Syncing Telemetry Hub...</span>
              </div>
            ) : rows.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-6 opacity-40">
                <div className="h-24 w-24 rounded-[2.5rem] border-2 border-dashed border-default-200 flex items-center justify-center">
                    <LuInbox size={40} className="text-default-300" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-[0.2em] leading-none">Inbox Empty</h3>
                    <p className="text-[9px] font-black tracking-[0.4em] text-default-400">NO NEW OPERATIONAL LOGS DETECTED</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {rows.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      className={`relative group h-full rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                        item.isRead 
                        ? "border-default-200/40 bg-transparent hover:bg-content2/10" 
                        : "border-primary/20 bg-primary/5 hover:border-primary/40 shadow-xl shadow-primary/5"
                      }`}
                    >
                      {/* Status indicator line */}
                      {!item.isRead && <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary shadow-[0_0_15px_rgba(249,115,22,0.5)]" />}
                      
                      <div className="p-6 flex items-start justify-between gap-6 relative z-10">
                        <div className="flex-1 min-w-0 flex gap-5">
                          <div className={`mt-1 h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 ${
                             item.isRead ? "bg-default-100 text-default-400" : "bg-primary/20 text-primary shadow-lg shadow-primary/10"
                          }`}>
                            {item.isRead ? <LuCheck size={18} /> : <LuBell size={18} className="animate-bounce" />}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className={`text-sm md:text-base font-black uppercase tracking-tight transition-colors ${item.isRead ? 'text-default-600' : 'text-foreground group-hover:text-primary'}`}>
                                {item.title}
                              </h3>
                              {!item.isRead && (
                                <Chip size="sm" variant="shadow" color="primary" className="h-5 px-3 text-[9px] font-black uppercase tracking-widest border-none">NEW</Chip>
                              )}
                            </div>
                            <p className={`text-sm leading-relaxed max-w-[800px] ${item.isRead ? 'text-default-400' : 'text-default-600'}`}>
                              {item.message}
                            </p>
                            <div className="flex items-center gap-4 pt-1">
                              <div className="px-3 py-1 rounded-full bg-default-100/50 border border-default-200/50 text-[9px] font-black uppercase tracking-widest text-default-500">
                                {item.type.replaceAll("_", " ")}
                              </div>
                              <span className="inline-flex items-center gap-2 text-[10px] font-bold text-default-400">
                                <LuClock size={12} />
                                {dayjs(item.createdAt).fromNow().toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {!item.isRead && (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              className="rounded-xl h-10 w-10 bg-default-100/50 hover:bg-success/20 hover:text-success transition-all border border-transparent hover:border-success/30"
                              onPress={() => markReadMutation.mutate(item._id)}
                              isLoading={markReadMutation.isPending}
                            >
                              <LuCheck size={18} />
                            </Button>
                          )}
                          {item.route && (
                            <Button
                              size="md"
                              color="primary"
                              variant={item.isRead ? "flat" : "shadow"}
                              className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent ${item.isRead ? 'bg-default-100 text-default-400 border-default-200' : 'shadow-[0_4px_12px_rgba(249,115,22,0.3)]'}`}
                              endContent={<LuExternalLink size={14} />}
                              onPress={async () => {
                                if (!item.isRead) {
                                  await markReadMutation.mutateAsync(item._id);
                                }
                                router.push(item.route);
                              }}
                            >
                              Inspect
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Improved Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 md:p-6 rounded-[2.5rem] bg-content1/40 backdrop-blur-xl border border-default-200/50 shadow-xl">
            <div className="flex items-center gap-5">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group transition-colors">
                    {isFetching ? <Spinner size="sm" color="primary" /> : <LuLayoutGrid size={18} />}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] font-black uppercase tracking-widest text-default-400 leading-none">Cluster Density</span>
                    <span className="text-sm font-black text-foreground leading-none mt-1.5 uppercase tracking-tighter">
                        {meta.total} Nodes Sync'd
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Button 
                        isIconOnly 
                        variant="flat" 
                        size="md" 
                        className="rounded-xl h-10 w-10 bg-content2/30 border border-default-200/60"
                        isDisabled={page <= 1} 
                        onPress={() => setPage((p) => p - 1)}
                    >
                        <LuChevronLeft size={18} />
                    </Button>
                    <div className="px-6 h-10 rounded-xl bg-content2/30 border border-default-200/60 flex items-center justify-center gap-2 min-w-[120px]">
                        <span className="text-[10px] font-black text-primary uppercase">{page}</span>
                        <div className="h-3 w-[1px] bg-default-300" />
                        <span className="text-[10px] font-black text-default-400 uppercase">{meta.pages}</span>
                    </div>
                    <Button 
                        isIconOnly 
                        variant="flat" 
                        size="md" 
                        className="rounded-xl h-10 w-10 bg-content2/30 border border-default-200/60"
                        isDisabled={page >= meta.pages} 
                        onPress={() => setPage((p) => p + 1)}
                    >
                        <LuChevronRight size={18} />
                    </Button>
                </div>
                
                <Divider orientation="vertical" className="h-8 bg-default-200/50 hidden md:block" />
                
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[9px] font-bold text-default-400 uppercase tracking-[0.2em] leading-none">Security Node</span>
                    <div className="flex items-center gap-2 mt-1.5">
                        <LuShieldCheck size={12} className="text-success" />
                        <span className="text-[10px] font-black text-foreground tracking-widest uppercase">ENCRYPTED</span>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};

export default NotificationsPage;
