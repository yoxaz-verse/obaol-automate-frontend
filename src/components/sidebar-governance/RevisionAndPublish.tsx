"use client";

import { Button, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";

export function RevisionStatus({ draftRevision, publishedRevision, publishedVersion, publishedAt, dirty }: {
  draftRevision: number;
  publishedRevision: number;
  publishedVersion: number;
  publishedAt?: string;
  dirty: boolean;
}) {
  return <div className="flex flex-wrap items-center gap-3 rounded-xl border border-default-200 bg-content1 p-3 text-xs text-default-500"><span>Draft <b className="text-foreground">revision {draftRevision}</b></span><span>Published <b className="text-foreground">v{publishedVersion} · revision {publishedRevision}</b></span>{publishedAt && <span>Published {new Date(publishedAt).toLocaleString()}</span>}{dirty && <Chip size="sm" color="warning" variant="flat">Unsaved changes</Chip>}{publishedVersion === 1 && <Chip size="sm" color="warning" variant="flat">Legacy behavior remains live until publish</Chip>}</div>;
}

export function ConflictBanner({ message, onReload, onCopy }: { message: string; onReload: () => void; onCopy: () => void }) {
  if (!message) return null;
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning-300 bg-warning-50 p-3 text-sm text-warning-800"><span>{message} Your local edits are still available.</span><span className="flex gap-2"><Button size="sm" variant="flat" onPress={onCopy}>Copy local changes</Button><Button size="sm" color="warning" onPress={onReload}>Reload current</Button></span></div>;
}

export function PublishDialog({ open, onOpenChange, saving, dirty, draftRevision, pageCount, functionCount, summary, onPublish }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  dirty: boolean;
  draftRevision: number;
  pageCount: number;
  functionCount: number;
  summary: { changedPages: number; assignmentChanges: number; changedSections: number };
  onPublish: () => void;
}) {
  return <Modal isOpen={open} onOpenChange={onOpenChange}><ModalContent><ModalHeader>Publish sidebar governance?</ModalHeader><ModalBody><p className="text-sm text-default-600">Publish draft revision {draftRevision} for {pageCount} pages and {functionCount} functions.</p><div className="grid grid-cols-3 gap-2">{[["Pages", summary.changedPages], ["Assignments", summary.assignmentChanges], ["Orders", summary.changedSections]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-default-100 p-3 text-center"><b className="block text-lg text-foreground">{value}</b><span className="text-[10px] uppercase tracking-wide text-default-500">{label}</span></div>)}</div>{dirty && <p className="text-sm text-warning">Unsaved edits will be saved before publication.</p>}</ModalBody><ModalFooter><Button variant="flat" onPress={() => onOpenChange(false)}>Cancel</Button><Button color="warning" className="font-bold" onPress={onPublish} isLoading={saving}>Publish complete draft</Button></ModalFooter></ModalContent></Modal>;
}
