"use client";

import { useContext, useMemo, useState } from "react";
import Link from "next/link";
import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiEdit2,
  FiHeadphones,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiClock,
  FiShield,
  FiHelpCircle,
  FiTruck,
  FiFileText,
  FiArrowRight,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import AuthContext from "@/context/AuthContext";
import Title from "@/components/titles";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { SupportContact, supportContactLinks } from "@/core/api/supportContacts";
import { showToastMessage } from "@/utils/utils";
import SupportWorkspace from "@/components/dashboard/SupportWorkspace";

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
    () => (Array.isArray(contactsQuery.data?.data?.data) ? contactsQuery.data.data.data : []),
    [contactsQuery.data]
  );

  const filteredContacts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return contacts;
    return contacts.filter((contact) =>
      `${contact.label} ${contact.displayPhoneNumber} ${contact.phoneNumber}`.toLowerCase().includes(needle)
    );
  }, [contacts, search]);

  const closeModal = () => {
    setIsOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? patchData(apiRoutes.supportContacts.update(editing._id), form)
        : postData(apiRoutes.supportContacts.create, form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["support-contacts"] });
      showToastMessage({ type: "success", message: editing ? "Support contact updated." : "Support contact added." });
      closeModal();
    },
    onError: (error: any) =>
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Could not save the support contact.",
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      patchData(apiRoutes.supportContacts.update(id), { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["support-contacts"] }),
    onError: (error: any) =>
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Could not update contact status.",
      }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (contact: SupportContact) => {
    setEditing(contact);
    setForm({ label: contact.label, phoneNumber: contact.phoneNumber, isActive: contact.isActive, sortOrder: contact.sortOrder });
    setIsOpen(true);
  };

  return (
    <section className="mx-2 md:mx-6 space-y-8 pb-12">
      <Title title="Customer Support" visuallyHidden />

      <SupportWorkspace />

      {/* Hero Header Banner with Brand Design */}
      <div className="relative overflow-hidden rounded-3xl border border-obaol-500/20 bg-gradient-to-r from-obaol-500/10 via-content1/90 to-background p-6 md:p-8 backdrop-blur-xl shadow-lg">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-obaol-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-obaol-400/30 bg-obaol-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-obaol-700 dark:text-obaol-300">
              <span className="h-2 w-2 rounded-full bg-default-400" />
              Fallback Contact Directory
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Customer Support &amp; Assistance
            </h1>

            <p className="text-sm md:text-base text-default-500 leading-relaxed font-medium">
              {isAdmin
                ? "Manage the official customer support contacts available to all trade associates and operators."
                : "Use these managed phone and WhatsApp contacts when live chat is offline or you need an alternate support channel."}
            </p>

            {/* SLA Meta Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-default-500 font-semibold">
              <div className="flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-1.5 border border-default-200/50">
                <FiClock className="text-obaol-500" />
                <span>Phone &amp; WhatsApp fallback</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-1.5 border border-default-200/50">
                <FiShield className="text-emerald-500" />
                <span>Mon–Sat: 09:00 - 19:00 IST</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-background/60 px-3 py-1.5 border border-default-200/50">
                <FiCheckCircle className="text-obaol-500" />
                <span>Verified Execution Desk</span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <Button
              color="warning"
              variant="flat"
              startContent={<FiPlus size={18} />}
              onPress={openCreate}
              className="font-bold tracking-tight px-6 h-11 rounded-xl shadow-md hover:bg-obaol-500 hover:text-obaol-950 transition-all shrink-0"
            >
              Add Contact
            </Button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="flex items-center justify-between gap-4">
          <Input
            aria-label="Search support contacts"
            placeholder="Search support contacts by name or phone..."
            value={search}
            onValueChange={setSearch}
            startContent={<FiSearch className="text-default-400" size={18} />}
            variant="bordered"
            className="max-w-md"
            classNames={{
              inputWrapper: "rounded-xl border-default-200 bg-content1",
            }}
          />
        </div>
      )}

      {/* Main Support Contacts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <FiHeadphones className="text-obaol-500" /> Direct Support Contacts
          </h2>
          <span className="text-xs text-default-400 font-semibold">
            {filteredContacts.length} {filteredContacts.length === 1 ? "Contact" : "Contacts"} Available
          </span>
        </div>

        {contactsQuery.isLoading ? (
          <div className="rounded-3xl border border-default-200/70 bg-content1 p-12 text-center text-default-500 shadow-sm">
            <FiRefreshCw className="mx-auto text-obaol-500 animate-spin mb-3" size={28} />
            <p className="font-semibold text-sm">Loading support contacts…</p>
          </div>
        ) : contactsQuery.isError ? (
          <div className="rounded-3xl border border-danger-200 bg-danger-50/40 p-8 text-center">
            <p className="text-danger-700 font-bold">We could not load customer support contacts right now.</p>
            <Button
              className="mt-4 font-bold rounded-xl"
              color="danger"
              variant="flat"
              startContent={<FiRefreshCw />}
              onPress={() => contactsQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="rounded-3xl border border-default-200/70 bg-content1/80 p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-default-200 bg-background/80 text-default-300">
              <FiHeadphones size={34} />
            </div>
            <p className="font-bold text-foreground text-lg">
              {isAdmin && search ? "No contacts match your search query." : "Customer support is currently unavailable."}
            </p>
            <p className="mt-1 text-sm text-default-500 max-w-md mx-auto">
              {isAdmin && !search
                ? "Add a support contact using the button above to make help available to associates."
                : "Please check back shortly or access self-service documentation below."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredContacts.map((contact) => {
              const links = supportContactLinks(contact);
              const initials = contact.label
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <article
                  key={contact._id}
                  className={`group relative overflow-hidden rounded-3xl border bg-content1 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-obaol-400/40 ${
                    contact.isActive ? "border-default-200/80" : "border-default-200 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-obaol-500/40 bg-obaol-500/10 font-black text-obaol-600 dark:text-obaol-400 text-lg shadow-sm">
                        {initials || "SP"}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground leading-snug">{contact.label}</h3>
                        <a
                          href={links.call}
                          className="text-sm font-semibold text-default-500 hover:text-obaol-500 transition-colors"
                        >
                          {contact.displayPhoneNumber}
                        </a>
                      </div>
                    </div>

                    {isAdmin && (
                      <Chip
                        size="sm"
                        color={contact.isActive ? "success" : "default"}
                        variant="flat"
                        className="font-bold text-[10px] uppercase"
                      >
                        {contact.isActive ? "Active" : "Inactive"}
                      </Chip>
                    )}
                  </div>

                  {!isAdmin && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        as="a"
                        href={links.call}
                        color="warning"
                        variant="flat"
                        className="font-bold tracking-tight h-10 rounded-xl hover:bg-obaol-500 hover:text-obaol-950 transition-all text-xs sm:text-sm"
                        startContent={<FiPhone size={15} />}
                      >
                        Call Now
                      </Button>
                      <Button
                        as="a"
                        href={links.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold tracking-tight h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-emerald-950 transition-all text-xs sm:text-sm"
                        startContent={<FaWhatsapp size={17} />}
                      >
                        Chat on WhatsApp
                      </Button>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-default-200/60 pt-4">
                      <div className="flex items-center gap-3">
                        <Switch
                          size="sm"
                          isSelected={contact.isActive}
                          isDisabled={statusMutation.isPending}
                          onValueChange={(isActive) => statusMutation.mutate({ id: contact._id, isActive })}
                        />
                        <span className="text-xs text-default-500 font-medium">Order {contact.sortOrder}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="flat"
                        color="default"
                        className="font-bold rounded-xl"
                        startContent={<FiEdit2 size={14} />}
                        onPress={() => openEdit(contact)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Support Coverage Capabilities Grid */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <FiLayers className="text-obaol-500" /> Support Coverage &amp; Assistance Areas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-3xl border border-default-200/70 bg-content1/80 p-6 shadow-sm transition-all hover:border-obaol-500/30">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-obaol-500/30 bg-obaol-500/10 text-obaol-500">
              <FiHelpCircle size={24} />
            </div>
            <h3 className="font-bold text-base text-foreground mb-1.5">Trade &amp; Enquiry Support</h3>
            <p className="text-xs text-default-500 leading-relaxed font-medium">
              Get direct guidance on commodity variant specifications, rate listings, sample requests, and buyer-seller counterparty verification.
            </p>
          </div>

          <div className="rounded-3xl border border-default-200/70 bg-content1/80 p-6 shadow-sm transition-all hover:border-obaol-500/30">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-obaol-500/30 bg-obaol-500/10 text-obaol-500">
              <FiTruck size={24} />
            </div>
            <h3 className="font-bold text-base text-foreground mb-1.5">Logistics &amp; Warehousing</h3>
            <p className="text-xs text-default-500 leading-relaxed font-medium">
              Real-time assistance with inland transport arrangements, warehouse booking, storage cost calculations, and port execution.
            </p>
          </div>

          <div className="rounded-3xl border border-default-200/70 bg-content1/80 p-6 shadow-sm transition-all hover:border-obaol-500/30">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-obaol-500/30 bg-obaol-500/10 text-obaol-500">
              <FiFileText size={24} />
            </div>
            <h3 className="font-bold text-base text-foreground mb-1.5">Compliance &amp; Invoicing</h3>
            <p className="text-xs text-default-500 leading-relaxed font-medium">
              Help with trade agreements, Letter of Intent (LOI) generation, tax documentation, commercial invoices, and export compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Self-Service & Documentation Links Banner */}
      <div className="rounded-3xl border border-default-200/70 bg-gradient-to-r from-default-50/50 via-content1 to-default-50/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-bold text-lg text-foreground">Looking for self-service platform documentation?</h3>
          <p className="text-xs md:text-sm text-default-500">
            Explore execution workflows, step-by-step guides, and trade listing discovery tools.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            as={Link}
            href="/dashboard/guidance"
            variant="flat"
            color="warning"
            className="font-bold tracking-tight rounded-xl h-10 px-5 text-xs sm:text-sm"
            endContent={<FiArrowRight size={16} />}
          >
            View Platform Guidance
          </Button>
          <Button
            as={Link}
            href="/dashboard/catalog"
            variant="bordered"
            className="font-bold tracking-tight rounded-xl h-10 px-5 text-xs sm:text-sm border-default-300"
          >
            Commodity Directory
          </Button>
        </div>
      </div>

      {/* Admin Edit / Add Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} placement="center">
        <ModalContent className="border border-default-200/30 bg-content1/95 backdrop-blur-xl">
          <ModalHeader className="font-bold text-lg">{editing ? "Edit Support Contact" : "Add Support Contact"}</ModalHeader>
          <ModalBody className="gap-4">
            <Input
              label="Contact label"
              placeholder="e.g. Jacob Alwin (Trade Support)"
              value={form.label}
              onValueChange={(label) => setForm((current) => ({ ...current, label }))}
              isRequired
              variant="bordered"
            />
            <Input
              label="International phone number"
              description="Include the country code, for example +91 90193 51483."
              value={form.phoneNumber}
              onValueChange={(phoneNumber) => setForm((current) => ({ ...current, phoneNumber }))}
              isRequired
              variant="bordered"
            />
            <Input
              type="number"
              label="Display order"
              value={String(form.sortOrder)}
              onValueChange={(value) => setForm((current) => ({ ...current, sortOrder: Number(value || 0) }))}
              variant="bordered"
            />
            <Switch
              isSelected={form.isActive}
              onValueChange={(isActive) => setForm((current) => ({ ...current, isActive }))}
              color="warning"
            >
              Active for associates
            </Switch>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={closeModal} className="font-semibold">
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={saveMutation.isPending}
              onPress={() => saveMutation.mutate()}
              isDisabled={!form.label.trim() || !form.phoneNumber.trim()}
              className="font-bold"
            >
              Save Contact
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
