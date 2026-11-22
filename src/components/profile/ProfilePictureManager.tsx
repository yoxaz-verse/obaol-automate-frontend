"use client";

import React, { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { FiCamera, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import instance from "@/core/api/axiosInstance";
import { deleteData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import UserAvatar from "./UserAvatar";
import ImagePicker from "@/components/ui/ImagePicker";

type Props = {
  name?: string;
  pictureUrl?: string | null;
  onChanged: () => Promise<void> | void;
};

const PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024;

export default function ProfilePictureManager({ name, pictureUrl, onChanged }: Props) {
  const [selected, setSelected] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const hasPicture = Boolean(pictureUrl);

  useEffect(() => {
    if (!selected) {
      setPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selected]);

  const upload = async (fileToUpload?: File | null) => {
    const targetFile = fileToUpload || selected;
    if (!targetFile) return;
    setBusy(true);
    try {
      const body = new FormData();
      body.append("picture", targetFile, targetFile.name);
      await instance.put("/profile-picture", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelected(null);
      setIsModalOpen(false);
      await onChanged();
      showToastMessage({ type: "success", message: "Profile picture updated." });
    } catch (error: any) {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Profile picture upload failed.",
      });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await deleteData("/profile-picture");
      setConfirmRemove(false);
      setIsModalOpen(false);
      setSelected(null);
      await onChanged();
      showToastMessage({ type: "success", message: "Profile picture removed." });
    } catch (error: any) {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Unable to remove profile picture.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2 sm:items-start">
        {/* Avatar with interactive camera action */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group relative block rounded-2xl border-2 db-border-subtle p-1 transition-all hover:border-obaol-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-obaol-500 focus:ring-offset-2 dark:focus:ring-offset-black"
            aria-label={hasPicture ? "Change picture" : "Upload picture"}
          >
            <UserAvatar
              name={name}
              src={previewUrl || pictureUrl}
              className="h-16 w-16 rounded-xl text-xl transition-transform group-hover:scale-[1.02] sm:h-20 sm:w-20"
            />
            {/* Hover overlay */}
            <div className="absolute inset-1 flex flex-col items-center justify-center rounded-xl bg-black/50 text-white opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
              <FiCamera className="text-base sm:text-lg" />
              <span className="mt-0.5 text-[9px] font-semibold tracking-wider uppercase">
                {hasPicture ? "Change" : "Upload"}
              </span>
            </div>
            {/* Camera badge */}
            <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-background bg-obaol-500 text-white shadow-md transition-transform group-hover:scale-110 sm:h-8 sm:w-8">
              <FiCamera size={13} />
            </span>
          </button>
        </div>

        {/* State-driven actions in this place */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
          {selected ? (
            /* Preview state (new image selected, unsaved) */
            <>
              <Button
                size="sm"
                color="warning"
                isLoading={busy}
                startContent={<FiUpload />}
                onPress={() => upload()}
                className="h-8 text-xs font-semibold"
              >
                Save change
              </Button>
              <Button
                size="sm"
                variant="light"
                isDisabled={busy}
                startContent={<FiX />}
                onPress={() => setSelected(null)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
            </>
          ) : hasPicture ? (
            /* Has existing picture state */
            <>
              <Button
                size="sm"
                variant="flat"
                startContent={<FiCamera />}
                onPress={() => setIsModalOpen(true)}
                className="h-7 px-2.5 text-xs font-semibold"
              >
                Change picture
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="light"
                startContent={<FiTrash2 />}
                onPress={() => setConfirmRemove(true)}
                className="h-7 px-2 text-xs font-semibold"
              >
                Remove picture
              </Button>
            </>
          ) : (
            /* Empty state (no picture) */
            <Button
              size="sm"
              color="warning"
              variant="flat"
              startContent={<FiCamera />}
              onPress={() => setIsModalOpen(true)}
              className="h-7 px-2.5 text-xs font-semibold"
            >
              Upload picture
            </Button>
          )}
        </div>
      </div>

      {/* Upload & Crop Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !busy && setIsModalOpen(false)}
        size="md"
        placement="center"
        classNames={{
          base: "db-panel border db-border-subtle",
          header: "border-b db-border-subtle",
          footer: "border-t db-border-subtle",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-foreground">
              {hasPicture ? "Change Profile Picture" : "Upload picture"}
            </h3>
            <p className="text-xs db-muted font-normal">
              Crop profile picture before saving. JPEG, PNG, or WebP up to 5 MB.
            </p>
          </ModalHeader>
          <ModalBody className="py-5">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <UserAvatar
                  name={name}
                  src={previewUrl || pictureUrl}
                  className="h-24 w-24 rounded-2xl text-2xl shadow-md sm:h-28 sm:w-28"
                />
                {selected && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    Preview
                  </span>
                )}
              </div>
              <div className="w-full">
                <ImagePicker
                  label="Profile picture"
                  value={selected}
                  existingUrl={pictureUrl}
                  preset="avatar"
                  accept="image/jpeg,image/png,image/webp"
                  maxSizeMb={PROFILE_PICTURE_MAX_BYTES / 1024 / 1024}
                  onChange={setSelected}
                  helperText="Crop profile picture before saving. JPEG, PNG, or WebP up to 5 MB."
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="flex items-center justify-between">
            <div>
              {hasPicture && (
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  startContent={<FiTrash2 />}
                  isDisabled={busy}
                  onPress={() => {
                    setIsModalOpen(false);
                    setConfirmRemove(true);
                  }}
                >
                  Remove picture
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="light"
                isDisabled={busy}
                onPress={() => {
                  setSelected(null);
                  setIsModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                color="warning"
                isLoading={busy}
                isDisabled={!selected}
                startContent={<FiUpload />}
                onPress={() => upload()}
              >
                {hasPicture ? "Save change" : "Upload picture"}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Modal to Remove Picture */}
      <Modal isOpen={confirmRemove} onClose={() => !busy && setConfirmRemove(false)} size="sm">
        <ModalContent>
          <ModalHeader>Remove profile picture?</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">Your initials will be shown until you upload another picture.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" isDisabled={busy} onPress={() => setConfirmRemove(false)}>Cancel</Button>
            <Button color="danger" isLoading={busy} onPress={remove}>Remove picture</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
