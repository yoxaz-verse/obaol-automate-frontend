import Link from "next/link";
import { Button, Chip } from "@nextui-org/react";

export const freightControl = "w-full rounded-xl border border-divider bg-background px-3 py-2 text-sm";
export const freightMessage = (error: any) => error?.response?.data?.message || "Unable to complete the request.";
export const freightLabel = (value?: string) => String(value || "—").replaceAll("_", " ");
export function FreightHeader({ eyebrow, title, description, actionHref, actionLabel }: { eyebrow: string; title: string; description: string; actionHref?: string; actionLabel?: string }) {
  return <header className="rounded-3xl border border-primary-300/30 bg-primary-50/50 p-6 dark:bg-primary-900/10"><p className="text-[10px] font-black tracking-[.3em] text-primary-600">{eyebrow}</p><div className="mt-2 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-black">{title}</h1><p className="mt-2 max-w-3xl text-sm text-default-500">{description}</p></div>{actionHref&&<Button as={Link} href={actionHref} color="primary">{actionLabel}</Button>}</div></header>;
}
export function StatusChip({ value }: { value?: string }) { const success=["PUBLISHED","AWARDED","DELIVERED","CLOSED","RELEASED","PAID","POSTED"].includes(String(value)); return <Chip size="sm" variant="flat" color={success?"success":String(value)==="CANCELLED"||String(value)==="REJECTED"?"danger":"primary"}>{freightLabel(value)}</Chip>; }

