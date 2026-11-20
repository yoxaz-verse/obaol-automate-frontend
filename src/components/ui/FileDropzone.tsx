"use client";

import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { Progress } from "@nextui-org/react";
import { FiAlertCircle, FiFile, FiRefreshCw, FiUploadCloud, FiX } from "react-icons/fi";

type Props = {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: string;
  uploadProgress?: number;
  onRetry?: () => void;
  action?: ReactNode;
};

const matchesAccept = (file: File, accept?: string) => {
  if (!accept) return true;
  return accept.split(",").map(value => value.trim().toLowerCase()).some(rule => {
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
  });
};

export default function FileDropzone({ label, file, onChange, accept, maxSizeMb = 15, disabled, required, helperText, error: externalError, uploadProgress, onRetry, action }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState("");
  const receive = (next?: File) => {
    if (!next) return;
    if (!matchesAccept(next, accept)) { setValidationError("This file type is not supported."); return; }
    if (next.size > maxSizeMb * 1024 * 1024) { setValidationError(`Choose a file up to ${maxSizeMb} MB.`); return; }
    setValidationError(""); onChange(next);
  };
  const drop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); if (!disabled) receive(event.dataTransfer.files?.[0]); };
  const error = externalError || validationError;
  return <div className="space-y-2"><div className="flex items-center justify-between gap-3"><label className="text-sm font-semibold">{label}{required ? <span className="ml-1 text-danger">*</span> : null}</label>{action}</div><div role="button" aria-label={label} aria-disabled={disabled} tabIndex={disabled ? -1 : 0} onClick={() => !disabled && input.current?.click()} onKeyDown={event => { if (!disabled && (event.key === "Enter" || event.key === " ")) input.current?.click(); }} onDragOver={event => event.preventDefault()} onDrop={drop} className={`rounded-2xl border-2 border-dashed p-5 text-center focus:outline-none focus:ring-2 focus:ring-obaol-500/30 ${error ? "border-danger-400 bg-danger-50/40" : "border-default-300 hover:border-obaol-500"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}><input ref={input} className="sr-only" type="file" accept={accept} disabled={disabled} required={required && !file} onChange={event => { receive(event.target.files?.[0]); event.currentTarget.value = ""; }} />{file ? <div><FiFile className="mx-auto text-2xl" /><p className="mt-2 break-all font-semibold">{file.name}</p><p className="text-xs text-default-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p><button type="button" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-danger" onClick={event => { event.stopPropagation(); setValidationError(""); onChange(null); }}><FiX /> Remove</button></div> : <div><FiUploadCloud className="mx-auto text-3xl text-default-400" /><p className="mt-2 font-semibold">Drop a file here or browse</p><p className="text-xs text-default-500">Maximum {maxSizeMb} MB</p></div>}</div>{typeof uploadProgress === "number" ? <Progress aria-label="Upload progress" value={uploadProgress} showValueLabel size="sm" /> : null}{error ? <div role="alert" className="flex items-center justify-between gap-2 text-xs text-danger"><span className="flex items-center gap-1"><FiAlertCircle />{error}</span>{onRetry ? <button type="button" className="inline-flex items-center gap-1 font-semibold" onClick={onRetry}><FiRefreshCw /> Retry</button> : null}</div> : helperText ? <p className="text-xs text-default-500">{helperText}</p> : null}</div>;
}
