"use client";

import { useContext, useMemo, useState } from "react";
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiHeadphones, FiPhone, FiPlus, FiRefreshCw, FiSearch } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import AuthContext from "@/context/AuthContext";
import Title from "@/components/titles";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { SupportContact, supportContactLinks } from "@/core/api/supportContacts";
import { showToastMessage } from "@/utils/utils";

type ContactForm = { label: string; phoneNumber: string; isActive: boolean; sortOrder: number };
const emptyForm: ContactForm = { label: "", phoneNumber: "+91", isActive: true, sortOrder: 0 };

export default function CustomerSupportPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<SupportContact | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyForm);

  const contactsQuery = useQuery({
    queryKey: ["support-contacts"],
    queryFn: () => getData(apiRoutes.supportContacts.list, {}, { cacheMode: "bypass" }),
  });
  const contacts = useMemo<SupportContact[]>(
    () => Array.isArray(contactsQuery.data?.data?.data) ? contactsQuery.data.data.data : [],
    [contactsQuery.data]
  );
  const filteredContacts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return contacts;
    return contacts.filter((contact) => `${contact.label} ${contact.displayPhoneNumber} ${contact.phoneNumber}`.toLowerCase().includes(needle));
  }, [contacts, search]);

  const closeModal = () => { setIsOpen(false); setEditing(null); setForm(emptyForm); };
  const saveMutation = useMutation({
    mutationFn: () => editing
      ? patchData(apiRoutes.supportContacts.update(editing._id), form)
      : postData(apiRoutes.supportContacts.create, form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["support-contacts"] });
      showToastMessage({ type: "success", message: editing ? "Support contact updated." : "Support contact added." });
      closeModal();
    },
    onError: (error: any) => showToastMessage({
      type: "error",
      message: error?.response?.data?.message || "Could not save the support contact.",
    }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => patchData(apiRoutes.supportContacts.update(id), { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["support-contacts"] }),
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Could not update contact status." }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setIsOpen(true); };
  const openEdit = (contact: SupportContact) => {
    setEditing(contact);
    setForm({ label: contact.label, phoneNumber: contact.phoneNumber, isActive: contact.isActive, sortOrder: contact.sortOrder });
    setIsOpen(true);
  };

  return (
    <section className="mx-2 md:mx-6 space-y-6">
      <Title title="Customer Support" visuallyHidden />
      <div className="rounded-2xl border border-default-200/70 bg-content1/95 p-5 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-obaol-500/10 p-3 text-obaol-700 dark:text-obaol-300"><FiHeadphones size={26} /></div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Customer Support</h1>
            <p className="mt-1 text-sm text-default-500">
              {isAdmin ? "Manage the support contacts available to every associate." : "Our company support team is ready to help with your OBAOL workspace."}
            </p>
          </div>
        </div>
        {isAdmin && <Button color="primary" startContent={<FiPlus />} onPress={openCreate}>Add Contact</Button>}
      </div>

      {isAdmin && (
        <Input
          aria-label="Search support contacts"
          placeholder="Search contacts"
          value={search}
          onValueChange={setSearch}
          startContent={<FiSearch className="text-default-400" />}
          className="max-w-md"
        />
      )}

      {contactsQuery.isLoading ? (
        <div className="rounded-2xl border border-default-200/70 bg-content1 p-10 text-center text-default-500">Loading support contacts…</div>
      ) : contactsQuery.isError ? (
        <div className="rounded-2xl border border-danger-200 bg-danger-50/50 p-8 text-center">
          <p className="text-danger-700">We could not load customer support right now.</p>
          <Button className="mt-4" variant="flat" startContent={<FiRefreshCw />} onPress={() => contactsQuery.refetch()}>Try Again</Button>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="rounded-2xl border border-default-200/70 bg-content1 p-10 text-center">
          <FiHeadphones size={34} className="mx-auto text-default-300" />
          <p className="mt-3 font-semibold text-foreground">{isAdmin && search ? "No contacts match your search." : "Customer support is currently unavailable."}</p>
          <p className="mt-1 text-sm text-default-500">{isAdmin && !search ? "Add a support contact to make help available to associates." : "Please check again later."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => {
            const links = supportContactLinks(contact);
            return (
              <article key={contact._id} className={`rounded-2xl border bg-content1 p-5 shadow-sm ${contact.isActive ? "border-default-200/70" : "border-default-200 opacity-70"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-lg text-foreground">{contact.label}</h2>
                    <a href={links.call} className="mt-1 inline-block text-sm text-default-500 hover:text-obaol-600">{contact.displayPhoneNumber}</a>
                  </div>
                  {isAdmin && <Chip size="sm" color={contact.isActive ? "success" : "default"} variant="flat">{contact.isActive ? "Active" : "Inactive"}</Chip>}
                </div>
                {!isAdmin && (
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button as="a" href={links.call} color="primary" variant="flat" startContent={<FiPhone />}>Call Now</Button>
                    <Button as="a" href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="bg-success-600 text-white" startContent={<FaWhatsapp />}>Chat on WhatsApp</Button>
                  </div>
                )}
                {isAdmin && (
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-default-200/60 pt-4">
                    <div className="flex items-center gap-3">
                      <Switch size="sm" isSelected={contact.isActive} isDisabled={statusMutation.isPending} onValueChange={(isActive) => statusMutation.mutate({ id: contact._id, isActive })} />
                      <span className="text-xs text-default-500">Order {contact.sortOrder}</span>
                    </div>
                    <Button size="sm" variant="light" startContent={<FiEdit2 />} onPress={() => openEdit(contact)}>Edit</Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalContent>
          <ModalHeader>{editing ? "Edit Support Contact" : "Add Support Contact"}</ModalHeader>
          <ModalBody className="gap-4">
            <Input label="Contact label" placeholder="General Support" value={form.label} onValueChange={(label) => setForm((current) => ({ ...current, label }))} isRequired />
            <Input label="International phone number" description="Include the country code, for example +91 98765 43210." value={form.phoneNumber} onValueChange={(phoneNumber) => setForm((current) => ({ ...current, phoneNumber }))} isRequired />
            <Input type="number" label="Display order" value={String(form.sortOrder)} onValueChange={(value) => setForm((current) => ({ ...current, sortOrder: Number(value || 0) }))} />
            <Switch isSelected={form.isActive} onValueChange={(isActive) => setForm((current) => ({ ...current, isActive }))}>Active for associates</Switch>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closeModal}>Cancel</Button>
            <Button color="primary" isLoading={saveMutation.isPending} onPress={() => saveMutation.mutate()} isDisabled={!form.label.trim() || !form.phoneNumber.trim()}>Save Contact</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
