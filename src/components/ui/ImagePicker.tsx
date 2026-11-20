"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { Button } from "@nextui-org/react";
import { FiImage, FiTrash2, FiUploadCloud } from "react-icons/fi";
import dynamic from "next/dynamic";
import type { ImagePresetName } from "./imagePresets";

const ImageCropDialog = dynamic(() => import("./ImageCropDialog"), { ssr: false });

type Props = {
  label: string;
  value?: File | null;
  existingUrl?: string | null;
  preset?: ImagePresetName;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
};

export default function ImagePicker({ label, value = null, existingUrl, preset = "product", accept = "image/jpeg,image/png,image/webp", maxSizeMb = 10, disabled, required, helperText, onChange, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!value) { setPreview(""); return; }
    const url = URL.createObjectURL(value); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const choose = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file."); return; }
    if (file.size > maxSizeMb * 1024 * 1024) { setError(`Choose an image up to ${maxSizeMb} MB.`); return; }
    setError(""); setPending(file);
  };
  const drop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); if (!disabled) choose(event.dataTransfer.files?.[0]); };
  const clear = () => { onChange(null); onRemove?.(); if (inputRef.current) inputRef.current.value = ""; };

  return <div className="space-y-2">
    <div className="flex items-center justify-between gap-3"><label className="text-sm font-semibold">{label}{required ? <span className="ml-1 text-danger">*</span> : null}</label>{(value || (existingUrl && onRemove)) && !disabled ? <Button size="sm" color="danger" variant="light" startContent={<FiTrash2 />} onPress={clear}>Remove</Button> : null}</div>
    <div role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled} onKeyDown={event => { if (!disabled && (event.key === "Enter" || event.key === " ")) inputRef.current?.click(); }} onDragOver={event => event.preventDefault()} onDrop={drop} onClick={() => !disabled && inputRef.current?.click()} className={`grid min-h-40 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-default-300 bg-default-50 p-4 text-center transition ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-obaol-500 hover:bg-obaol-500/5 focus:outline-none focus:ring-2 focus:ring-obaol-500/30"}`}>
      {preview || existingUrl ? <>{/* eslint-disable-next-line @next/next/no-img-element -- supports local blob and authenticated preview URLs */}<img src={preview || existingUrl || ""} alt={`${label} preview`} className={`max-h-56 max-w-full ${preset === "signature" || preset === "logo" ? "object-contain" : "object-cover"}`} /></> : <div><FiImage className="mx-auto text-3xl text-default-400" /><p className="mt-2 font-semibold">Drop an image here or browse</p><p className="mt-1 text-xs text-default-500">JPEG, PNG, or WebP · up to {maxSizeMb} MB</p></div>}
    </div>
    <input ref={inputRef} type="file" className="sr-only" accept={accept} disabled={disabled} onChange={event => { choose(event.target.files?.[0]); event.currentTarget.value = ""; }} />
    {helperText ? <p className="text-xs text-default-500">{helperText}</p> : null}{error ? <p role="alert" className="text-xs text-danger">{error}</p> : null}
    <div className="flex justify-start"><Button size="sm" variant="flat" startContent={<FiUploadCloud />} isDisabled={disabled} onPress={() => inputRef.current?.click()}>{value || existingUrl ? "Replace image" : "Choose image"}</Button></div>
    <ImageCropDialog file={pending} preset={preset} isOpen={Boolean(pending)} onCancel={() => setPending(null)} onSave={file => { onChange(file); setPending(null); }} />
  </div>;
}
