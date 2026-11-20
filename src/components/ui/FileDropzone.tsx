"use client";

import { useRef, type DragEvent } from "react";
import { FiFile, FiUploadCloud, FiX } from "react-icons/fi";

type Props = { label: string; file: File | null; onChange: (file: File | null) => void; accept?: string; maxSizeMb?: number; disabled?: boolean; helperText?: string };

export default function FileDropzone({ label, file, onChange, accept, maxSizeMb = 15, disabled, helperText }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const receive = (next?: File) => { if (next && next.size <= maxSizeMb * 1024 * 1024) onChange(next); };
  const drop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); if (!disabled) receive(event.dataTransfer.files?.[0]); };
  return <div className="space-y-2"><label className="text-sm font-semibold">{label}</label><div role="button" tabIndex={disabled ? -1 : 0} onClick={() => !disabled && input.current?.click()} onKeyDown={event => { if (!disabled && (event.key === "Enter" || event.key === " ")) input.current?.click(); }} onDragOver={event => event.preventDefault()} onDrop={drop} className="rounded-2xl border-2 border-dashed border-default-300 p-5 text-center hover:border-obaol-500 focus:outline-none focus:ring-2 focus:ring-obaol-500/30"><input ref={input} className="sr-only" type="file" accept={accept} disabled={disabled} onChange={event => receive(event.target.files?.[0])} />{file ? <div><FiFile className="mx-auto text-2xl" /><p className="mt-2 break-all font-semibold">{file.name}</p><p className="text-xs text-default-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p><button type="button" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-danger" onClick={event => { event.stopPropagation(); onChange(null); }}><FiX /> Remove</button></div> : <div><FiUploadCloud className="mx-auto text-3xl text-default-400" /><p className="mt-2 font-semibold">Drop a file here or browse</p><p className="text-xs text-default-500">Maximum {maxSizeMb} MB</p></div>}</div>{helperText ? <p className="text-xs text-default-500">{helperText}</p> : null}</div>;
}
