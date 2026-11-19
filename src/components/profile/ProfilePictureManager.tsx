"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Slider } from "@nextui-org/react";
import { FiCamera, FiTrash2, FiUpload } from "react-icons/fi";
import instance from "@/core/api/axiosInstance";
import { deleteData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import UserAvatar from "./UserAvatar";

type Props = { name?: string; pictureUrl?: string | null; onChanged: () => Promise<void> | void };

export default function ProfilePictureManager({ name, pictureUrl, onChanged }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState("profile-picture");
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => () => { if (source.startsWith("blob:")) URL.revokeObjectURL(source); }, [source]);

  const choose = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      showToastMessage({ type: "error", message: "Choose a JPEG, PNG, or WebP image up to 5 MB." });
      return;
    }
    if (source.startsWith("blob:")) URL.revokeObjectURL(source);
    setSource(URL.createObjectURL(file)); setFileName(file.name); setZoom(1);
  };

  const croppedBlob = async () => {
    const image = new Image(); image.src = source; await image.decode();
    const crop = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
    const sx = (image.naturalWidth - crop) / 2, sy = (image.naturalHeight - crop) / 2;
    const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 512;
    canvas.getContext("2d")!.drawImage(image, sx, sy, crop, crop, 0, 0, 512, 512);
    return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Crop failed")), "image/webp", .9));
  };

  const upload = async () => {
    setBusy(true);
    try {
      const body = new FormData(); body.append("picture", await croppedBlob(), fileName.replace(/\.[^.]+$/, "") + ".webp");
      await instance.put("/profile-picture", body, { headers: { "Content-Type": "multipart/form-data" } });
      setSource(""); await onChanged();
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
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <div className="group relative rounded-2xl border db-border-subtle db-panel p-1.5 shadow-sm">
        <UserAvatar name={name} src={pictureUrl} className="h-16 w-16 rounded-xl text-xl sm:h-20 sm:w-20" />
        <button type="button" aria-label="Change profile picture" onClick={() => inputRef.current?.click()} className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full border border-default-200 bg-background text-obaol-600 shadow-md transition hover:bg-obaol-50"><FiCamera /></button>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-1 sm:justify-start">
        <Button size="sm" variant="light" startContent={<FiUpload />} onPress={() => inputRef.current?.click()}>{pictureUrl ? "Change" : "Upload picture"}</Button>
        {pictureUrl && <Button size="sm" color="danger" variant="light" startContent={<FiTrash2 />} onPress={() => setConfirmRemove(true)}>Remove</Button>}
      </div>
      <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { choose(e.target.files?.[0]); e.currentTarget.value = ""; }} />
    </div>
    <Modal isOpen={Boolean(source)} onClose={() => !busy && setSource("")} size="lg">
      <ModalContent><ModalHeader>Crop profile picture</ModalHeader><ModalBody>
        <div className="mx-auto h-72 w-72 overflow-hidden rounded-full bg-default-100"><img src={source} alt="Profile picture crop preview" className="h-full w-full object-cover" style={{ transform: `scale(${zoom})` }} /></div>
        <Slider label="Zoom" minValue={1} maxValue={3} step={.05} value={zoom} onChange={value => setZoom(Number(value))} />
        <p className="text-xs text-default-500">The centered square will be saved as a 512 × 512 optimized image.</p>
      </ModalBody><ModalFooter><Button variant="light" isDisabled={busy} onPress={() => setSource("")}>Cancel</Button><Button color="warning" isLoading={busy} onPress={upload}>Save picture</Button></ModalFooter></ModalContent>
    </Modal>
    <Modal isOpen={confirmRemove} onClose={() => !busy && setConfirmRemove(false)} size="sm">
      <ModalContent><ModalHeader>Remove profile picture?</ModalHeader><ModalBody><p className="text-sm text-default-600">Your initials will be shown until you upload another picture.</p></ModalBody><ModalFooter><Button variant="light" isDisabled={busy} onPress={() => setConfirmRemove(false)}>Cancel</Button><Button color="danger" isLoading={busy} onPress={remove}>Remove picture</Button></ModalFooter></ModalContent>
    </Modal>
  </>;
}
