"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button, Chip, Input, Select, SelectItem, Spinner, Textarea } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LuArchive, LuBell, LuCheck, LuChevronLeft, LuChevronRight, LuExternalLink, LuPlus, LuSend, LuTag } from "react-icons/lu";
import { deleteData, getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes, notificationCategoryRoutes, notificationRoutes } from "@/core/api/apiRoutes";
import { normalizeApiError } from "@/core/api/apiErrors";
import AuthContext from "@/context/AuthContext";
import { extractList } from "@/core/data/queryUtils";
import { showToastMessage } from "@/utils/utils";

dayjs.extend(relativeTime);

type Category = { _id: string; name: string; description?: string; isActive: boolean };
type Participant = { id: string; name: string; email: string; role: string };
type NotificationRow = { _id: string; type: string; title: string; message: string; route?: string; isRead: boolean; priority?: string; categoryId?: string; categoryName?: string; createdAt: string };
type Meta = { page: number; limit: number; pages: number; total: number };

const panel = "rounded-2xl border border-default-200 bg-content1 p-4 shadow-sm md:p-5";

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const role = String(user?.role || "").toLowerCase().replace(/[_-]/g, "");
  const isAdmin = role === "admin";
  const isSupport = role === "customersupport";
  const canCompose = isAdmin || isSupport;
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");
  const [categoryId, setCategoryId] = useState("");
  const [roles, setRoles] = useState<Set<string>>(new Set());
  const [functions, setFunctions] = useState<Set<string>>(new Set());
  const [participants, setParticipants] = useState<Set<string>>(new Set());
  const [participantSearch, setParticipantSearch] = useState("");
  const [composerError, setComposerError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryError, setCategoryError] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["notification-categories", isAdmin],
    queryFn: async () => extractList(await getData(notificationCategoryRoutes.list, isAdmin ? { includeArchived: true } : undefined)) as Category[],
    enabled: canCompose,
  });
  const categories = categoriesQuery.data || [];
  const activeCategories = categories.filter((item) => item.isActive);

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "page", page, unreadOnly, categoryFilter],
    queryFn: async () => {
      const response: any = await getData(notificationRoutes.list, { page, limit: 25, unreadOnly, ...(categoryFilter ? { categoryId: categoryFilter } : {}) });
      return { rows: (response?.data?.data || []) as NotificationRow[], meta: (response?.data?.meta || { page, limit: 25, pages: 1, total: 0 }) as Meta };
    },
    refetchInterval: 30000,
  });
  const rows = useMemo(() => notificationsQuery.data?.rows || [], [notificationsQuery.data?.rows]);
  const meta = notificationsQuery.data?.meta || { page, limit: 25, pages: 1, total: 0 };

  const functionsQuery = useQuery({
    queryKey: ["notification-broadcast-functions"],
    queryFn: () => getData(apiRoutes.companyFunction.getAll, { page: 1, limit: 200, sort: "orderIndex:asc" }),
    enabled: isAdmin,
  });
  const companyFunctions = extractList(functionsQuery.data);

  const participantsQuery = useQuery({
    queryKey: ["notification-support-participants", participantSearch],
    queryFn: async () => extractList(await getData(notificationRoutes.supportParticipants, { search: participantSearch, limit: 50 })) as Participant[],
    enabled: isSupport,
  });

  useEffect(() => { patchData(notificationRoutes.markSectionRead("notifications"), {}).catch(() => undefined); }, []);

  const refreshNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread-summary"] });
  };
  const notifyMutationError = (error: unknown, fallback: string) => showToastMessage({ type: "error", message: normalizeApiError(error, fallback).message });
  const markRead = useMutation({ mutationFn: (id: string) => patchData(notificationRoutes.readOne(id), {}), onSuccess: refreshNotifications, onError: (error) => notifyMutationError(error, "Failed to mark the notification as read.") });
  const markAll = useMutation({ mutationFn: () => patchData(notificationRoutes.readAll, {}), onSuccess: refreshNotifications, onError: (error) => notifyMutationError(error, "Failed to mark notifications as read.") });

  const broadcast = useMutation({
    mutationFn: () => postData(notificationRoutes.broadcast, {
      title: title.trim(), message: message.trim(), priority, ...(categoryId ? { categoryId } : {}),
      ...(isAdmin ? { roles: Array.from(roles), companyFunctionIds: Array.from(functions) } : { recipientUserIds: Array.from(participants) }),
    }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Notification sent successfully." });
      setTitle(""); setMessage(""); setPriority("medium"); setCategoryId(""); setRoles(new Set()); setFunctions(new Set()); setParticipants(new Set()); setComposerError("");
      refreshNotifications();
    },
    onError: (error) => {
      const normalized = normalizeApiError(error, "Failed to send notification.");
      setComposerError(normalized.message);
      showToastMessage({ type: "error", message: normalized.message });
    },
  });

  const categoryMutation = useMutation({
    mutationFn: () => editingCategory
      ? patchData(notificationCategoryRoutes.update(editingCategory._id), { name: categoryName.trim(), description: categoryDescription.trim() })
      : postData(notificationCategoryRoutes.create, { name: categoryName.trim(), description: categoryDescription.trim() }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: editingCategory ? "Category updated." : "Category created." });
      setCategoryName(""); setCategoryDescription(""); setEditingCategory(null); setCategoryError("");
      queryClient.invalidateQueries({ queryKey: ["notification-categories"] });
    },
    onError: (error) => {
      const normalized = normalizeApiError(error, "Failed to save category.");
      setCategoryError(normalized.message);
      showToastMessage({ type: "error", message: normalized.message });
    },
  });

  const archiveCategory = useMutation({
    mutationFn: (id: string) => deleteData(notificationCategoryRoutes.archive(id)),
    onSuccess: () => { showToastMessage({ type: "success", message: "Category archived." }); queryClient.invalidateQueries({ queryKey: ["notification-categories"] }); },
    onError: (error) => { const normalized = normalizeApiError(error, "Failed to archive category."); setCategoryError(normalized.message); showToastMessage({ type: "error", message: normalized.message }); },
  });

  const canMarkAll = useMemo(() => rows.some((item) => !item.isRead), [rows]);
  const submitNotification = () => {
    setComposerError("");
    if (!title.trim() || !message.trim()) { setComposerError("Title and message are required."); return; }
    if (isSupport && participants.size === 0) { setComposerError("Select at least one support participant."); return; }
    if (!broadcast.isPending) broadcast.mutate();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-semibold text-foreground">Notifications</h1><p className="mt-1 text-sm text-default-500">Workspace updates and messages that need your attention.</p></div>
        <div className="flex flex-wrap gap-2"><Button size="sm" variant={unreadOnly ? "solid" : "flat"} color={unreadOnly ? "primary" : "default"} onPress={() => { setPage(1); setUnreadOnly((value) => !value); }}>Unread only</Button><Button size="sm" variant="flat" startContent={<LuCheck />} isDisabled={!canMarkAll || markAll.isPending} isLoading={markAll.isPending} onPress={() => markAll.mutate()}>Mark all read</Button></div>
      </header>

      {canCompose && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className={panel} aria-labelledby="compose-heading">
          <div className="mb-4 flex items-center gap-2"><LuSend className="text-primary" /><h2 id="compose-heading" className="font-semibold">Send a notification</h2></div>
          {composerError && <div role="alert" className="mb-4 rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">{composerError}</div>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Title" value={title} onValueChange={(value) => { setTitle(value); setComposerError(""); }} isRequired />
            <Select label="Category (optional)" selectedKeys={categoryId ? new Set([categoryId]) : new Set()} onSelectionChange={(keys) => setCategoryId(String(Array.from(keys as Set<string>)[0] || ""))}>{activeCategories.map((item) => <SelectItem key={item._id}>{item.name}</SelectItem>)}</Select>
            <Select label="Priority" selectedKeys={new Set([priority])} onSelectionChange={(keys) => setPriority(String(Array.from(keys as Set<string>)[0] || "medium"))}><SelectItem key="low">Low</SelectItem><SelectItem key="medium">Medium</SelectItem><SelectItem key="high">High</SelectItem></Select>
            {isAdmin ? <Select label="Target roles" selectionMode="multiple" placeholder="All roles" selectedKeys={roles} onSelectionChange={(keys) => setRoles(new Set(Array.from(keys as Set<string>).map(String)))}><SelectItem key="Admin">Admin</SelectItem><SelectItem key="Associate">Associate</SelectItem><SelectItem key="Operator">Operator</SelectItem></Select> : <Input label="Find support participants" value={participantSearch} onValueChange={setParticipantSearch} placeholder="Search name or email" />}
          </div>
          {isAdmin ? <Select className="mt-3" label="Company functions (optional)" selectionMode="multiple" selectedKeys={functions} onSelectionChange={(keys) => setFunctions(new Set(Array.from(keys as Set<string>).map(String)))} isDisabled={functionsQuery.isLoading}>{companyFunctions.map((item: any) => <SelectItem key={String(item._id)}>{String(item.name || "")}</SelectItem>)}</Select> : <><Select className="mt-3" label="Recipients" selectionMode="multiple" selectedKeys={participants} onSelectionChange={(keys) => { setParticipants(new Set(Array.from(keys as Set<string>).map(String))); setComposerError(""); }} isLoading={participantsQuery.isLoading} placeholder="Select users with support history">{(participantsQuery.data || []).map((item) => <SelectItem key={item.id} textValue={`${item.name} ${item.email}`}>{item.name} — {item.email}</SelectItem>)}</Select>{participantsQuery.isError && <p role="alert" className="mt-2 text-sm text-danger">{normalizeApiError(participantsQuery.error, "Failed to load support participants.").message}</p>}</>}
          <Textarea className="mt-3" label="Message" value={message} onValueChange={(value) => { setMessage(value); setComposerError(""); }} minRows={3} isRequired />
          <div className="mt-4 flex justify-end"><Button color="primary" startContent={<LuSend />} isLoading={broadcast.isPending} isDisabled={broadcast.isPending} onPress={submitNotification}>Send notification</Button></div>
        </section>

        <section className={panel} aria-labelledby="categories-heading">
          <div className="mb-4 flex items-center gap-2"><LuTag className="text-primary" /><h2 id="categories-heading" className="font-semibold">Categories</h2></div>
          {(categoryError || categoriesQuery.isError) && <div role="alert" className="mb-3 rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">{categoryError || normalizeApiError(categoriesQuery.error, "Failed to load categories.").message}</div>}
          <Input label={editingCategory ? "Rename category" : "New category"} value={categoryName} maxLength={80} isRequired onValueChange={(value) => { setCategoryName(value); setCategoryError(""); }} />
          <Textarea className="mt-2" label="Description (optional)" value={categoryDescription} maxLength={240} minRows={2} onValueChange={(value) => { setCategoryDescription(value); setCategoryError(""); }} />
          <div className="mt-3 flex gap-2"><Button size="sm" color="primary" startContent={<LuPlus />} isLoading={categoryMutation.isPending} isDisabled={!categoryName.trim() || categoryMutation.isPending} onPress={() => categoryMutation.mutate()}>{editingCategory ? "Save" : "Add category"}</Button>{editingCategory && <Button size="sm" variant="flat" onPress={() => { setEditingCategory(null); setCategoryName(""); setCategoryDescription(""); }}>Cancel</Button>}</div>
          <div className="mt-4 max-h-52 space-y-2 overflow-y-auto">{categories.map((item) => <div key={item._id} className="flex items-center justify-between gap-2 rounded-xl bg-default-100 px-3 py-2"><div className="min-w-0"><p className="truncate text-sm font-medium">{item.name}</p><p className="truncate text-xs text-default-500">{item.isActive ? item.description || "Active" : "Archived"}</p></div>{isAdmin && <div className="flex shrink-0 gap-1">{item.isActive ? <><Button size="sm" variant="light" onPress={() => { setEditingCategory(item); setCategoryName(item.name); setCategoryDescription(item.description || ""); setCategoryError(""); }}>Edit</Button><Button isIconOnly size="sm" variant="light" color="danger" aria-label={`Archive ${item.name}`} onPress={() => archiveCategory.mutate(item._id)}><LuArchive /></Button></> : <Button size="sm" variant="light" onPress={() => patchData(notificationCategoryRoutes.update(item._id), { name: item.name, description: item.description || "", isActive: true }).then(() => { showToastMessage({ type: "success", message: "Category restored." }); queryClient.invalidateQueries({ queryKey: ["notification-categories"] }); }).catch((error) => { const normalized = normalizeApiError(error, "Failed to restore category."); setCategoryError(normalized.message); showToastMessage({ type: "error", message: normalized.message }); })}>Restore</Button>}</div>}</div>)}{!categoriesQuery.isLoading && categories.length === 0 && <p className="text-sm text-default-500">No categories yet.</p>}</div>
        </section>
      </div>}

      <section className={panel} aria-labelledby="inbox-heading">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><LuBell className="text-primary" /><h2 id="inbox-heading" className="font-semibold">Inbox</h2><Chip size="sm" variant="flat">{meta.total}</Chip></div>{canCompose && <Select aria-label="Filter by category" size="sm" className="w-full sm:w-56" placeholder="All categories" selectedKeys={categoryFilter ? new Set([categoryFilter]) : new Set()} onSelectionChange={(keys) => { setCategoryFilter(String(Array.from(keys as Set<string>)[0] || "")); setPage(1); }}>{categories.map((item) => <SelectItem key={item._id}>{item.name}{item.isActive ? "" : " (archived)"}</SelectItem>)}</Select>}</div>
        {notificationsQuery.isError && <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">{normalizeApiError(notificationsQuery.error, "Failed to load notifications.").message}</div>}
        {notificationsQuery.isLoading ? <div className="flex justify-center py-14"><Spinner label="Loading notifications" /></div> : rows.length === 0 ? <div className="py-14 text-center"><LuBell className="mx-auto mb-3 text-3xl text-default-300" /><p className="font-medium">No notifications</p><p className="text-sm text-default-500">You’re all caught up.</p></div> : <div className="divide-y divide-default-200">{rows.map((item) => <article key={item._id} className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-start ${item.isRead ? "opacity-70" : ""}`}><div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.isRead ? "bg-default-300" : "bg-primary"}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{item.title}</h3>{!item.isRead && <Chip size="sm" color="primary" variant="flat">New</Chip>}{item.categoryName && <Chip size="sm" variant="bordered">{item.categoryName}</Chip>}</div><p className="mt-1 text-sm text-default-600">{item.message}</p><p className="mt-2 text-xs text-default-400">{dayjs(item.createdAt).fromNow()}</p></div><div className="flex shrink-0 gap-2">{!item.isRead && <Button size="sm" variant="flat" startContent={<LuCheck />} onPress={() => markRead.mutate(item._id)}>Read</Button>}{item.route && <Button size="sm" color="primary" variant="flat" endContent={<LuExternalLink />} onPress={async () => { if (!item.isRead) await markRead.mutateAsync(item._id); router.push(item.route!); }}>Open</Button>}</div></article>)}</div>}
        <div className="mt-4 flex items-center justify-between border-t border-default-200 pt-4"><span className="text-sm text-default-500">Page {meta.page} of {meta.pages}</span><div className="flex gap-2"><Button isIconOnly size="sm" variant="flat" aria-label="Previous page" isDisabled={page <= 1} onPress={() => setPage((value) => value - 1)}><LuChevronLeft /></Button><Button isIconOnly size="sm" variant="flat" aria-label="Next page" isDisabled={page >= meta.pages} onPress={() => setPage((value) => value + 1)}><LuChevronRight /></Button></div></div>
      </section>
    </div>
  );
}
