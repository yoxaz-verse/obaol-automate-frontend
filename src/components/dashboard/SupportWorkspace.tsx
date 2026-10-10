"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Chip, Input, Select, SelectItem, Switch, Textarea } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCheckCircle, FiClock, FiHeadphones, FiMessageCircle, FiRefreshCw, FiSend, FiUserCheck, FiUsers } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { supportChatRoutes } from "@/core/api/apiRoutes";
import { useSoundEffect } from "@/context/SoundContext";
import { formatLastSeen, isOnline } from "@/utils/presence";
import { showToastMessage } from "@/utils/utils";
import { normalizeApiError } from "@/core/api/apiErrors";

type Status = "WAITING" | "ACTIVE" | "RESOLVED";
type Agent = { _id: string; name: string; email: string; phone?: string; lastSeenAt?: string; isAvailable: boolean; activeChatCount: number; capacity: number; canAccept: boolean };
type Conversation = {
  _id: string; subject: string; status: Status; requesterId: string; requesterRole: string;
  requester?: { id: string; name: string; email: string; phone?: string; role: string; company?: string; lastSeenAt?: string; priorConversations?: Array<{ _id: string; subject: string; status: Status }> };
  assignedAgent?: Agent | string | null; lastMessageAt?: string; lastMessagePreview?: string;
  createdAt: string; resolvedAt?: string; reopenUntil?: string;
};
type Message = { _id: string; senderId: string; senderRole: string; body: string; createdAt: string };

const roleKey = (value: unknown) => String(value || "").toLowerCase().replace(/[\s_-]+/g, "");

export default function SupportWorkspace() {
  const { user, refreshUser } = useContext(AuthContext);
  const client = useQueryClient();
  const { play } = useSoundEffect();
  const normalizedRole = roleKey(user?.role);
  const isAgent = normalizedRole === "customersupport";
  const isAdmin = normalizedRole === "admin";
  const isStaff = isAgent || isAdmin;
  const [selectedId, setSelectedId] = useState("");
  const [subject, setSubject] = useState("");
  const [openingMessage, setOpeningMessage] = useState("");
  const [message, setMessage] = useState("");
  const [reassignTo, setReassignTo] = useState("");
  const previousWaiting = useRef(-1);

  const availability = useQuery({
    queryKey: ["support", "availability"],
    queryFn: async () => (await getData(supportChatRoutes.availability, {}, { cacheMode: "bypass" })).data?.data,
    refetchInterval: 10_000,
  });
  const conversations = useQuery({
    queryKey: ["support", "conversations"],
    queryFn: async () => (await getData(supportChatRoutes.conversations, {}, { cacheMode: "bypass" })).data?.data || [],
    refetchInterval: 10_000,
  });
  const agents = useQuery({
    queryKey: ["support", "agents"],
    queryFn: async () => (await getData(supportChatRoutes.onlineAgents, {}, { cacheMode: "bypass" })).data?.data || [],
    enabled: isStaff,
    refetchInterval: 10_000,
  });

  const rows = useMemo<Conversation[]>(() => Array.isArray(conversations.data) ? conversations.data : [], [conversations.data]);
  const roster = useMemo<Agent[]>(() => Array.isArray(agents.data) ? agents.data : [], [agents.data]);
  const selected = rows.find((row) => row._id === selectedId) || rows.find((row) => row.status !== "RESOLVED") || rows[0];
  const selectedConversationId = selected?._id || "";
  const messages = useQuery({
    queryKey: ["support", "messages", selectedConversationId],
    queryFn: async () => (await getData(supportChatRoutes.messages(selectedConversationId), {}, { cacheMode: "bypass" })).data?.data || [],
    enabled: Boolean(selectedConversationId),
    refetchInterval: 3_000,
  });
  const messageRows = useMemo<Message[]>(() => Array.isArray(messages.data) ? messages.data : [], [messages.data]);

  useEffect(() => {
    if (!isStaff) return;
    const waiting = rows.filter((row) => row.status === "WAITING").length;
    if (waiting > previousWaiting.current && previousWaiting.current >= 0) play("notification");
    previousWaiting.current = waiting;
  }, [isStaff, play, rows]);

  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["support", "availability"] }),
      client.invalidateQueries({ queryKey: ["support", "conversations"] }),
      client.invalidateQueries({ queryKey: ["support", "agents"] }),
      selectedConversationId ? client.invalidateQueries({ queryKey: ["support", "messages", selectedConversationId] }) : Promise.resolve(),
    ]);
  };
  const action = (fn: () => Promise<any>, success: string) => ({
    mutationFn: fn,
    onSuccess: async (response: any) => { if (response?.data?.data?._id) setSelectedId(response.data.data._id); await refresh(); showToastMessage({ type: "success" as const, message: success }); },
    onError: (error: any) => showToastMessage({ type: "error", message: normalizeApiError(error).message }),
  });
  const createConversation = useMutation(action(
    () => postData(supportChatRoutes.conversations, { subject, message: openingMessage }), "Your request is in the support queue."
  ));
  const claim = useMutation(action(() => postData(supportChatRoutes.claim(selectedConversationId), {}), "Conversation claimed."));
  const resolve = useMutation(action(() => postData(supportChatRoutes.resolve(selectedConversationId), {}), "Conversation resolved."));
  const reopen = useMutation(action(() => postData(supportChatRoutes.reopen(selectedConversationId), {}), "Conversation returned to the queue."));
  const reassign = useMutation(action(() => patchData(supportChatRoutes.reassign(selectedConversationId), { agentId: reassignTo }), "Conversation reassigned."));
  const send = useMutation({
    mutationFn: () => postData(supportChatRoutes.messages(selectedConversationId), { body: message }),
    onSuccess: async () => { setMessage(""); await refresh(); },
    onError: (error: any) => showToastMessage({ type: "error", message: normalizeApiError(error).message }),
  });
  const toggleAvailability = useMutation({
    mutationFn: (isAvailable: boolean) => patchData(supportChatRoutes.setAvailability, { isAvailable }),
    onSuccess: async () => { await refreshUser(); await refresh(); },
    onError: (error: any) => showToastMessage({ type: "error", message: normalizeApiError(error).message }),
  });

  const waiting = rows.filter((row) => row.status === "WAITING");
  const active = rows.filter((row) => row.status === "ACTIVE");
  const resolved = rows.filter((row) => row.status === "RESOLVED");
  const assignedId = typeof selected?.assignedAgent === "object" ? selected.assignedAgent?._id : selected?.assignedAgent;
  const isMine = isAgent && String(assignedId || "") === String(user?.id || "");
  const canSend = Boolean(selected && selected.status !== "RESOLVED" && (!isAgent || isMine) && (isAdmin || selected.status === "ACTIVE" || !isStaff));

  return (
    <section className="space-y-5" aria-label="Live customer support">
      <div className="relative overflow-hidden rounded-3xl border border-obaol-500/20 bg-gradient-to-r from-obaol-500/10 via-content1 to-background p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-obaol-700 dark:text-obaol-300"><span className={`h-2.5 w-2.5 rounded-full ${availability.data?.online ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-default-400"}`} />{availability.data?.online ? "Support is online" : "Leave a message"}</div><h1 className="text-2xl font-black sm:text-3xl">{isStaff ? "Customer Support Desk" : "Talk to Customer Support"}</h1><p className="mt-2 max-w-2xl text-sm text-default-500">{isStaff ? "Claim waiting requests, help customers, and keep every conversation accountable." : availability.data?.online ? "An available support specialist can join your conversation." : "No specialist is free right now. Your request will stay queued for the next on-duty agent."}</p></div>
          {isAgent && <div className="flex items-center gap-4 rounded-2xl border border-default-200 bg-background/70 p-4"><div><p className="text-sm font-bold">On-duty availability</p><p className="text-xs text-default-500">You can handle up to three chats.</p></div><Switch aria-label="Support availability" color="success" isSelected={Boolean(user?.isAvailable)} isDisabled={toggleAvailability.isPending} onValueChange={(value) => toggleAvailability.mutate(value)} /></div>}
        </div>
      </div>

      {isStaff && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[{ label: "Waiting", value: waiting.length, icon: <FiClock /> }, { label: "Active", value: active.length, icon: <FiMessageCircle /> }, { label: "Online agents", value: availability.data?.onlineAgentCount || 0, icon: <FiUsers /> }, { label: "Can accept", value: availability.data?.availableAgentCount || 0, icon: <FiUserCheck /> }].map((item) => <div key={item.label} className="rounded-2xl border border-default-200 bg-content1 p-4"><div className="text-obaol-500">{item.icon}</div><div className="mt-2 text-2xl font-black">{item.value}</div><div className="text-xs font-bold uppercase tracking-wider text-default-400">{item.label}</div></div>)}
      </div>}

      {!isStaff && rows.every((row) => row.status === "RESOLVED") && <div className="rounded-3xl border border-default-200 bg-content1 p-6"><h2 className="font-black">Start a support conversation</h2><div className="mt-4 grid gap-4"><Input label="Subject" maxLength={160} value={subject} onValueChange={setSubject} /><Textarea label="How can we help?" minRows={4} maxLength={4000} value={openingMessage} onValueChange={setOpeningMessage} /><Button color="warning" className="font-bold sm:w-fit" startContent={<FiHeadphones />} isLoading={createConversation.isPending} isDisabled={!subject.trim() || !openingMessage.trim()} onPress={() => createConversation.mutate()}>Join support queue</Button></div></div>}

      <div className="grid min-h-[540px] gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-default-200 bg-content1 p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-black">{isStaff ? "Conversations" : "Your conversations"}</h2><Button isIconOnly size="sm" variant="light" aria-label="Refresh conversations" onPress={() => refresh()}><FiRefreshCw /></Button></div>
          <div className="max-h-[480px] space-y-2 overflow-y-auto">
            {rows.map((row) => <button key={row._id} type="button" onClick={() => setSelectedId(row._id)} className={`w-full rounded-2xl border p-3 text-left transition ${selected?._id === row._id ? "border-obaol-500 bg-obaol-500/10" : "border-default-200 hover:border-obaol-500/40"}`}><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-bold">{row.subject}</span><Chip size="sm" color={row.status === "WAITING" ? "warning" : row.status === "ACTIVE" ? "success" : "default"} variant="flat">{row.status}</Chip></div>{row.requester && <p className="mt-1 truncate text-xs text-default-500">{row.requester.name} · {row.requester.role}</p>}<p className="mt-2 line-clamp-2 text-xs text-default-400">{row.lastMessagePreview}</p></button>)}
            {!rows.length && <p className="py-12 text-center text-sm text-default-400">No conversations yet.</p>}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col rounded-3xl border border-default-200 bg-content1 p-4 sm:p-5">
          {selected ? <>
            <header className="border-b border-default-200 pb-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-black">{selected.subject}</h2>{selected.requester && <div className="mt-1 text-xs text-default-500"><span className="font-bold text-foreground">{selected.requester.name}</span> · {selected.requester.role}{selected.requester.company ? ` · ${selected.requester.company}` : ""}<br />{selected.requester.email}{selected.requester.phone ? ` · ${selected.requester.phone}` : ""} · {isOnline(selected.requester.lastSeenAt) ? "Online" : `Last seen ${formatLastSeen(selected.requester.lastSeenAt)}`}</div>}</div><div className="flex flex-wrap gap-2">{isAgent && selected.status === "WAITING" && <Button size="sm" color="warning" className="font-bold" isDisabled={!user?.isAvailable} isLoading={claim.isPending} onPress={() => claim.mutate()}>Claim chat</Button>}{selected.status !== "RESOLVED" && (isAdmin || isMine || !isStaff) && <Button size="sm" variant="flat" startContent={<FiCheckCircle />} isLoading={resolve.isPending} onPress={() => resolve.mutate()}>Resolve</Button>}{!isStaff && selected.status === "RESOLVED" && selected.reopenUntil && new Date(selected.reopenUntil).getTime() >= Date.now() && <Button size="sm" color="warning" variant="flat" isLoading={reopen.isPending} onPress={() => reopen.mutate()}>Reopen</Button>}</div></div>
              {selected.requester?.priorConversations && selected.requester.priorConversations.length > 0 && <p className="mt-2 text-xs text-default-400">{selected.requester.priorConversations.length} recent prior support conversation{selected.requester.priorConversations.length === 1 ? "" : "s"}</p>}
              {isAdmin && selected.status !== "RESOLVED" && <div className="mt-3 flex max-w-md gap-2"><Select size="sm" label="Assign agent" selectedKeys={reassignTo ? [reassignTo] : []} onSelectionChange={(keys) => setReassignTo(String(Array.from(keys)[0] || ""))}>{roster.map((agent) => <SelectItem key={agent._id} textValue={agent.name}>{agent.name} ({agent.activeChatCount}/{agent.capacity})</SelectItem>)}</Select><Button size="sm" className="mt-2" isDisabled={!reassignTo} isLoading={reassign.isPending} onPress={() => reassign.mutate()}>Assign</Button></div>}
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto py-5" aria-live="polite">{messageRows.map((item) => { const mine = String(item.senderId) === String(user?.id); return <div key={item._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 ${mine ? "bg-obaol-500 text-obaol-950" : "bg-default-100"}`}><p className="whitespace-pre-wrap break-words text-sm">{item.body}</p><p className="mt-1 text-[10px] opacity-60">{new Date(item.createdAt).toLocaleString()}</p></div></div>; })}{messages.isLoading && <p className="text-center text-sm text-default-400">Loading messages…</p>}</div>
            <div className="border-t border-default-200 pt-4">{canSend ? <div className="flex items-end gap-2"><Textarea aria-label="Support message" placeholder="Write a message…" minRows={1} maxRows={5} value={message} onValueChange={setMessage} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && message.trim()) { event.preventDefault(); send.mutate(); } }} /><Button isIconOnly color="warning" aria-label="Send message" isLoading={send.isPending} isDisabled={!message.trim()} onPress={() => send.mutate()}><FiSend /></Button></div> : <p className="rounded-xl bg-default-100 p-3 text-center text-sm text-default-500">{selected.status === "RESOLVED" ? "This conversation is resolved." : selected.status === "WAITING" && isStaff ? "Claim or assign this conversation before replying." : "This conversation is assigned to another agent."}</p>}</div>
          </> : <div className="flex flex-1 flex-col items-center justify-center text-center text-default-400"><FiMessageCircle size={38} /><p className="mt-3 font-bold">Select a conversation</p></div>}
        </div>
      </div>

      {isStaff && roster.length > 0 && <div className="rounded-3xl border border-default-200 bg-content1 p-5"><h2 className="font-black">Online support team</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{roster.map((agent) => <div key={agent._id} className="flex items-center justify-between rounded-2xl border border-default-200 p-3"><div><p className="text-sm font-bold">{agent.name}</p><p className="text-xs text-default-500">{agent.email}</p></div><Chip size="sm" color={agent.canAccept ? "success" : agent.isAvailable ? "warning" : "default"} variant="dot">{agent.isAvailable ? `${agent.activeChatCount}/${agent.capacity}` : "Unavailable"}</Chip></div>)}</div></div>}
    </section>
  );
}
