"use client";

import React, { useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { FiCamera, FiTrash2, FiUpload } from "react-icons/fi";
import instance from "@/core/api/axiosInstance";
import { deleteData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import UserAvatar from "./UserAvatar";
import ImagePicker from "@/components/ui/ImagePicker";

type Props = { name?: string; pictureUrl?: string | null; onChanged: () => Promise<void> | void };
const PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024;

export default function ProfilePictureManager({ name, pictureUrl, onChanged }: Props) {
  const [selected, setSelected] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const upload = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const body = new FormData(); body.append("picture", selected, selected.name);
      await instance.put("/profile-picture", body, { headers: { "Content-Type": "multipart/form-data" } });
      setSelected(null); await onChanged();
      showToastMessage({ type: "success", message: "Profile picture updated." });
    } catch (error: any) {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Profile picture upload failed." });
    } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await deleteData("/profile-picture"); setConfirmRemove(false); await onChanged(); showToastMessage({ type: "success", message: "Profile picture removed." }); }
    catch (error: any) { showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to remove profile picture." }); }
    finally { setBusy(false); }
  };

  return <>
    <div className="flex w-full max-w-md flex-col items-center gap-2 sm:items-start">
      <div className="group relative rounded-2xl border db-border-subtle db-panel p-1.5 shadow-sm">
        <UserAvatar name={name} src={pictureUrl} className="h-16 w-16 rounded-xl text-xl sm:h-20 sm:w-20" />
        <span className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full border border-default-200 bg-background text-obaol-600 shadow-md"><FiCamera /></span>
      </div>
      <div className="mt-4 w-full"><ImagePicker label="Profile picture" value={selected} existingUrl={pictureUrl} preset="avatar" accept="image/jpeg,image/png,image/webp" maxSizeMb={PROFILE_PICTURE_MAX_BYTES / 1024 / 1024} onChange={setSelected} helperText="Crop profile picture before saving. JPEG, PNG, or WebP up to 5 MB." /></div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" color="warning" isLoading={busy} isDisabled={!selected} startContent={<FiUpload />} onPress={upload}>{pictureUrl ? "Save change" : "Upload picture"}</Button>
        {pictureUrl && <Button size="sm" color="danger" variant="light" startContent={<FiTrash2 />} onPress={() => setConfirmRemove(true)}>Remove picture</Button>}
      </div>
    </div>
    <Modal isOpen={confirmRemove} onClose={() => !busy && setConfirmRemove(false)} size="sm">
      <ModalContent><ModalHeader>Remove profile picture?</ModalHeader><ModalBody><p className="text-sm text-default-600">Your initials will be shown until you upload another picture.</p></ModalBody><ModalFooter><Button variant="light" isDisabled={busy} onPress={() => setConfirmRemove(false)}>Cancel</Button><Button color="danger" isLoading={busy} onPress={remove}>Remove picture</Button></ModalFooter></ModalContent>
    </Modal>
  </>;
}
