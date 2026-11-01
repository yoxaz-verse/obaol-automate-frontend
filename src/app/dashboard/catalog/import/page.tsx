"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardBody, Chip, Input } from "@nextui-org/react";
import { FiArrowLeft, FiDownload, FiUpload } from "react-icons/fi";
import { postMultipart } from "@/core/api/apiHandler";
import instance from "@/core/api/axiosInstance";

type Summary = { created: number; updated: number; unchanged: number; rejected: number; rows: number; errors?: Array<{ row: number; message: string }> };

export default function CatalogImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);

  const upload = async () => {
    if (!file) { setError("Choose an Excel workbook first."); return; }
    setBusy(true); setError(""); setSummary(null);
    try {
      const body = new FormData(); body.append("file", file);
      const response = await postMultipart("/catalog/import", body);
      setSummary(response.data?.data || null);
    } catch (cause: any) {
      setSummary(cause?.response?.data?.data || null);
      setError(cause?.response?.data?.message || "Catalog import failed.");
    } finally { setBusy(false); }
  };

  const downloadTemplate = async () => {
    setError("");
    try {
      const response = await instance.get("/catalog/import/template", { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "catalog-import-template.xlsx"; anchor.click();
      URL.revokeObjectURL(url);
    } catch { setError("The catalog template could not be downloaded."); }
  };

  return <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
    <Button as={Link} href="/dashboard/catalog" variant="light" startContent={<FiArrowLeft />}>Back to catalog</Button>
    <div><h1 className="text-3xl font-black">Import catalog from Excel</h1><p className="mt-2 text-sm text-default-500">Upsert categories, subcategories, products, and variants without removing existing records.</p></div>
    <Card className="border border-default-200"><CardBody className="gap-5 p-5">
      <div className="rounded-xl bg-default-100 p-4 text-sm"><b>Required columns</b><p className="mt-1 text-default-600">Category, Subcategory, Product, Variant. Description columns are optional. The complete workbook is validated before any row is saved.</p></div>
      <div className="flex flex-wrap gap-3"><Button variant="bordered" startContent={<FiDownload />} onPress={downloadTemplate}>Download template</Button></div>
      <Input type="file" accept=".xlsx,.xls" label="Catalog workbook" labelPlacement="outside" onChange={(event) => { setFile(event.target.files?.[0] || null); setError(""); }} />
      {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
      <Button color="warning" startContent={<FiUpload />} isLoading={busy} isDisabled={!file || busy} onPress={upload}>Validate and import</Button>
    </CardBody></Card>
    {summary && <Card className="border border-default-200"><CardBody className="gap-4 p-5"><h2 className="text-xl font-bold">Import result</h2><div className="flex flex-wrap gap-2"><Chip color="success" variant="flat">{summary.created} created</Chip><Chip color="primary" variant="flat">{summary.updated} updated</Chip><Chip variant="flat">{summary.unchanged} unchanged</Chip><Chip color={summary.rejected ? "danger" : "default"} variant="flat">{summary.rejected} rejected</Chip></div>{summary.errors?.length ? <div className="max-h-72 overflow-auto rounded-xl border border-danger-200 p-3">{summary.errors.map((item) => <p key={`${item.row}-${item.message}`} className="py-1 text-sm text-danger">Row {item.row}: {item.message}</p>)}</div> : null}</CardBody></Card>}
  </div>;
}
