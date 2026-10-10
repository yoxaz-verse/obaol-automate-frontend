"use client";

import { useMemo, useRef, useState } from "react";
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiHeadphones, FiPlus, FiTrash2 } from "react-icons/fi";
import { deleteData, getData, patchData, postData } from "@/core/api/apiHandler";
import { customerSupportAgentRoutes } from "@/core/api/apiRoutes";
import { formatLastSeen, isOnline } from "@/utils/presence";
import { showToastMessage } from "@/utils/utils";
import { CustomerSupportAgentForm, CustomerSupportAgentFormErrors, validateCustomerSupportAgentForm } from "@/utils/customerSupportAgentForm";

type Agent = { _id: string; name: string; email: string; phone?: string; isActive: boolean; isAvailable: boolean; lastSeenAt?: string; lastLoginAt?: string };
const emptyForm: CustomerSupportAgentForm = { name: "", email: "", phone: "", password: "", isActive: true };

const getRequestError = (error: any) => {
  if (!error?.response) return "Could not reach the server. Check your connection and try again.";
  return String(error.response?.data?.message || error.message || "Could not save support agent.");
};

export default function CustomerSupportAgents() {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [form, setForm] = useState<CustomerSupportAgentForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<CustomerSupportAgentFormErrors>({});
  const [requestError, setRequestError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
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
      setOpen(false); setEditing(null); setForm(emptyForm); setFormErrors({}); setRequestError("");
      showToastMessage({ type: "success", message: editing ? "Support agent updated." : "Support agent created." });
    },
    onError: (error: any) => {
      const message = getRequestError(error);
      const serverErrors = error?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        setFormErrors((current) => ({ ...current, ...serverErrors }));
      }
      setRequestError(message);
      showToastMessage({ type: "error", message });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteData(customerSupportAgentRoutes.remove(id)),
    onSuccess: () => client.invalidateQueries({ queryKey: ["customer-support-agents"] }),
    onError: (error: any) => showToastMessage({ type: "error", message: getRequestError(error) }),
  });

  const updateField = <K extends keyof CustomerSupportAgentForm>(field: K, value: CustomerSupportAgentForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "name" || field === "email" || field === "password") {
      setFormErrors((current) => ({ ...current, [field]: undefined }));
    }
    setRequestError("");
  };

  const closeEditor = () => {
    if (save.isPending) return;
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setRequestError("");
  };

  const submit = () => {
    if (save.isPending) return;
    const errors = validateCustomerSupportAgentForm(form, Boolean(editing));
    setFormErrors(errors);
    setRequestError("");
    const firstError = errors.name ? nameRef : errors.email ? emailRef : errors.password ? passwordRef : null;
    if (firstError) {
      requestAnimationFrame(() => firstError.current?.focus());
      return;
    }
    save.mutate();
  };

  const edit = (agent: Agent) => {
    setEditing(agent);
    setForm({ name: agent.name, email: agent.email, phone: agent.phone || "", password: "", isActive: agent.isActive });
    setFormErrors({});
    setRequestError("");
    setOpen(true);
  };

  return (
    <section className="space-y-5 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-black">Customer Support Agents</h2><p className="text-sm text-default-500">Create staff accounts and control access to the live support workspace.</p></div>
        <Button color="warning" startContent={<FiPlus />} className="font-bold" onPress={() => { setEditing(null); setForm(emptyForm); setFormErrors({}); setRequestError(""); setOpen(true); }}>Add support agent</Button>
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
      <Modal isOpen={open} isDismissable={!save.isPending} onOpenChange={(isOpen) => { if (!isOpen) closeEditor(); }}><ModalContent><ModalHeader>{editing ? "Edit support agent" : "Create support agent"}</ModalHeader><ModalBody>
        {requestError && <div role="alert" aria-live="assertive" className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-300">{requestError}</div>}
        <Input ref={nameRef} label="Name" value={form.name} onValueChange={(name) => updateField("name", name)} isRequired isInvalid={Boolean(formErrors.name)} errorMessage={formErrors.name} />
        <Input ref={emailRef} label="Email" type="email" value={form.email} onValueChange={(email) => updateField("email", email)} isRequired isInvalid={Boolean(formErrors.email)} errorMessage={formErrors.email} />
        <Input label="Phone" value={form.phone} onValueChange={(phone) => updateField("phone", phone)} />
        <Input ref={passwordRef} label={editing ? "New password (optional)" : "Temporary password"} description="Use at least 8 characters." type="password" value={form.password} onValueChange={(password) => updateField("password", password)} isRequired={!editing} isInvalid={Boolean(formErrors.password)} errorMessage={formErrors.password} />
        <Switch isSelected={form.isActive} onValueChange={(isActive) => updateField("isActive", isActive)}>Account active</Switch>
      </ModalBody><ModalFooter><Button variant="light" isDisabled={save.isPending} onPress={closeEditor}>Cancel</Button><Button color="warning" isLoading={save.isPending} isDisabled={save.isPending} onPress={submit}>Save</Button></ModalFooter></ModalContent></Modal>
    </section>
  );
}
