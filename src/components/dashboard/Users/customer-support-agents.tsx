"use client";

import { useMemo, useState } from "react";
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiHeadphones, FiPlus, FiTrash2 } from "react-icons/fi";
import { deleteData, getData, patchData, postData } from "@/core/api/apiHandler";
import { customerSupportAgentRoutes } from "@/core/api/apiRoutes";
import { formatLastSeen, isOnline } from "@/utils/presence";
import { showToastMessage } from "@/utils/utils";

type Agent = { _id: string; name: string; email: string; phone?: string; isActive: boolean; isAvailable: boolean; lastSeenAt?: string; lastLoginAt?: string };
type FormState = { name: string; email: string; phone: string; password: string; isActive: boolean };
const emptyForm: FormState = { name: "", email: "", phone: "", password: "", isActive: true };

export default function CustomerSupportAgents() {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const query = useQuery({
    queryKey: ["customer-support-agents"],
    queryFn: async () => (await getData(customerSupportAgentRoutes.list, {}, { cacheMode: "bypass" })).data?.data || [],
  });
  const agents = useMemo<Agent[]>(() => Array.isArray(query.data) ? query.data : [], [query.data]);
  const save = useMutation({
    mutationFn: () => editing
      ? patchData(customerSupportAgentRoutes.update(editing._id), { ...form, password: form.password || undefined })
      : postData(customerSupportAgentRoutes.create, form),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["customer-support-agents"] });
      setOpen(false); setEditing(null); setForm(emptyForm);
      showToastMessage({ type: "success", message: editing ? "Support agent updated." : "Support agent created." });
    },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Could not save support agent." }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteData(customerSupportAgentRoutes.remove(id)),
    onSuccess: () => client.invalidateQueries({ queryKey: ["customer-support-agents"] }),
  });

  const edit = (agent: Agent) => {
    setEditing(agent);
    setForm({ name: agent.name, email: agent.email, phone: agent.phone || "", password: "", isActive: agent.isActive });
    setOpen(true);
  };

  return (
    <section className="space-y-5 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-black">Customer Support Agents</h2><p className="text-sm text-default-500">Create staff accounts and control access to the live support workspace.</p></div>
        <Button color="warning" startContent={<FiPlus />} className="font-bold" onPress={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}>Add support agent</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {agents.map((agent) => {
          const online = isOnline(agent.lastSeenAt);
          return <article key={agent._id} className="rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-obaol-500/10 text-obaol-600"><FiHeadphones /></div><div className="min-w-0"><h3 className="truncate font-bold">{agent.name}</h3><p className="truncate text-sm text-default-500">{agent.email}</p></div></div>
              <div className="flex gap-2"><Button isIconOnly size="sm" variant="flat" aria-label={`Edit ${agent.name}`} onPress={() => edit(agent)}><FiEdit2 /></Button><Button isIconOnly size="sm" color="danger" variant="flat" aria-label={`Remove ${agent.name}`} onPress={() => remove.mutate(agent._id)}><FiTrash2 /></Button></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2"><Chip size="sm" color={agent.isActive ? "success" : "default"} variant="flat">{agent.isActive ? "Active" : "Inactive"}</Chip><Chip size="sm" color={online ? "success" : "default"} variant="dot">{online ? "Online" : `Last seen ${formatLastSeen(agent.lastSeenAt)}`}</Chip><Chip size="sm" color={agent.isAvailable ? "warning" : "default"} variant="flat">{agent.isAvailable ? "On duty" : "Off duty"}</Chip></div>
          </article>;
        })}
        {!query.isLoading && agents.length === 0 && <div className="rounded-2xl border border-dashed border-default-300 p-10 text-center text-default-500 lg:col-span-2">No customer support agents yet.</div>}
      </div>
      <Modal isOpen={open} onOpenChange={setOpen}><ModalContent><ModalHeader>{editing ? "Edit support agent" : "Create support agent"}</ModalHeader><ModalBody>
        <Input label="Name" value={form.name} onValueChange={(name) => setForm((v) => ({ ...v, name }))} isRequired />
        <Input label="Email" type="email" value={form.email} onValueChange={(email) => setForm((v) => ({ ...v, email }))} isRequired />
        <Input label="Phone" value={form.phone} onValueChange={(phone) => setForm((v) => ({ ...v, phone }))} />
        <Input label={editing ? "New password (optional)" : "Temporary password"} type="password" value={form.password} onValueChange={(password) => setForm((v) => ({ ...v, password }))} isRequired={!editing} />
        <Switch isSelected={form.isActive} onValueChange={(isActive) => setForm((v) => ({ ...v, isActive }))}>Account active</Switch>
      </ModalBody><ModalFooter><Button variant="light" onPress={() => setOpen(false)}>Cancel</Button><Button color="warning" isLoading={save.isPending} onPress={() => save.mutate()}>Save</Button></ModalFooter></ModalContent></Modal>
    </section>
  );
}
