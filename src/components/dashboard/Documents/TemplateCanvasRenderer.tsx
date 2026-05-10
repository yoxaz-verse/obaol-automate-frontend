"use client";

import React from "react";
import { Card, CardBody } from "@nextui-org/react";

type Typography = {
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
};

type LayoutBlock = {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  zIndex?: number;
  typography?: Typography;
};

type LayoutElement = {
  id: string;
  type: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible?: boolean;
  zIndex?: number;
  content?: string;
  src?: string;
  style?: Record<string, any>;
  typography?: Typography;
  binding?: {
    bindingType?: "SYSTEM_TOKEN" | "MANUAL_FIELD";
    token?: string;
    fieldKey?: string;
    required?: boolean;
    defaultValue?: string;
  };
};

type LayoutSchema = {
  version: number;
  page: {
    width: number;
    height: number;
  };
  blocks: LayoutBlock[];
  elements?: LayoutElement[];
};

type Props = {
  layoutSchema: LayoutSchema;
  docLabel: string;
  data: any;
  editable?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
  onBlockMove?: (id: string, nextX: number, nextY: number) => void;
};

const fmt = (n: any) => {
  const value = Number(n || 0);
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
};

const isValidHexColor = (value: string) => /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(String(value || "").trim());
const resolveTextColor = (value?: string) => {
  const color = String(value || "").trim();
  return isValidHexColor(color) ? color : "#111827";
};

const renderContent = (block: LayoutBlock, data: any, docLabel: string) => {
  const header = (
    <div className="space-y-1 text-xs">
      <div className="text-[10px] uppercase tracking-widest opacity-80">OBAOL Supreme</div>
      <div className="text-lg font-semibold">{docLabel}</div>
      <div className="text-xs opacity-85">{data?.documentNumber || "Draft"}</div>
      <div className="text-xs opacity-85">{data?.docDate || "-"}</div>
    </div>
  );

  if (block.type === "HEADER") return header;

  if (block.type === "PARTIES") {
    return (
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="font-semibold mb-1">Buyer</div>
          <div>{data?.buyer?.name || "-"}</div>
          <div>{data?.buyer?.email || "-"}</div>
          <div>{data?.buyer?.phone || "-"}</div>
        </div>
        <div>
          <div className="font-semibold mb-1">Seller</div>
          <div>{data?.seller?.name || "-"}</div>
          <div>{data?.seller?.email || "-"}</div>
          <div>{data?.seller?.phone || "-"}</div>
        </div>
      </div>
    );
  }

  if (block.type === "LINE_ITEMS") {
    const items = Array.isArray(data?.lineItems) ? data.lineItems : [];
    return (
      <div className="text-xs">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-default-200">
              <th className="text-left py-1">Product</th>
              <th className="text-left py-1">Variant</th>
              <th className="text-right py-1">Qty</th>
              <th className="text-right py-1">Rate</th>
              <th className="text-right py-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 10).map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-default-100">
                <td className="py-1">{item?.productName || "-"}</td>
                <td className="py-1">{item?.productVariantName || "-"}</td>
                <td className="py-1 text-right">{fmt(item?.quantityMT)} MT</td>
                <td className="py-1 text-right">{fmt(item?.ratePerKg)}</td>
                <td className="py-1 text-right">{fmt(item?.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "TOTALS") {
    const totals = data?.totals || {};
    return (
      <div className="space-y-1 text-xs">
        <div className="flex justify-between"><span>Subtotal</span><span>{fmt(totals?.subtotal)}</span></div>
        <div className="flex justify-between"><span>Commission</span><span>{fmt(totals?.commissionTotal)}</span></div>
        <div className="flex justify-between"><span>Tax</span><span>{fmt(totals?.taxAmount)}</span></div>
        <div className="flex justify-between font-semibold"><span>Total</span><span>{fmt(totals?.grandTotal)}</span></div>
      </div>
    );
  }

  if (block.type === "TERMS") {
    const terms = data?.terms || {};
    return (
      <div className="space-y-2 text-xs">
        <div><span className="font-semibold">Payment:</span> {terms?.paymentTerms || "-"}</div>
        <div><span className="font-semibold">Delivery:</span> {terms?.deliveryTerms || "-"}</div>
        <div><span className="font-semibold">Notes:</span> {terms?.notes || "-"}</div>
      </div>
    );
  }

  if (block.type === "CERTIFICATE") {
    return <div className="text-xs">Certificate details for {docLabel} will render here with live document data.</div>;
  }

  if (block.type === "SHIPPING") {
    return <div className="text-xs">Shipping details for {docLabel} will render here with live document data.</div>;
  }

  return <div className="text-xs">{block.label}</div>;
};

const renderElement = (el: LayoutElement, data: any) => {
  if (el.type === "LINE") {
    return <div className="w-full h-full" style={{ borderTop: "1px solid #6b7280", ...(el.style || {}) }} />;
  }
  if (el.type === "SHAPE") {
    return <div className="w-full h-full" style={{ border: "1px solid #6b7280", ...(el.style || {}) }} />;
  }
  if (el.type === "IMAGE") {
    if (!el.src) return <div className="text-[10px] opacity-70">Image</div>;
    return <img src={el.src} alt={el.label || "element-image"} className="w-full h-full object-contain" />;
  }
  if (el.type === "TABLE") {
    return (
      <table className="w-full text-[10px] border-collapse">
        <tbody>
          <tr><td className="border border-default-300 px-1 py-1">{el.content || "Table"}</td></tr>
        </tbody>
      </table>
    );
  }
  if (el.type === "MANUAL_INPUT") {
    const label = el.label || el.binding?.fieldKey || "Input";
    const value = data?.manualInput?.[String(el.binding?.fieldKey || "")] || el.binding?.defaultValue || "";
    return (
      <div className="h-full w-full border border-dashed border-default-300 rounded px-2 py-1 text-[11px]">
        <div className="opacity-75">{label}{el.binding?.required ? " *" : ""}</div>
        <div className="mt-1">{String(value || "________________")}</div>
      </div>
    );
  }
  if (el.type === "SIGNATURE") {
    return (
      <div className="h-full w-full flex flex-col justify-end">
        <div className="border-t border-default-400 pt-1 text-center text-[11px]">{el.content || "Authorized Signatory"}</div>
      </div>
    );
  }

  const text = el.content || data?.resolvedText?.[el.id] || el.label || "Text";
  return <div className="text-xs whitespace-pre-wrap">{text}</div>;
};

export default function TemplateCanvasRenderer({
  layoutSchema,
  docLabel,
  data,
  editable = false,
  selectedBlockId,
  onSelectBlock,
  onBlockMove,
}: Props) {
  const pageW = Number(layoutSchema?.page?.width || 794);
  const pageH = Number(layoutSchema?.page?.height || 1123);

  const letterhead = data?.letterheadConfig || null;

  const layers = [
    ...(layoutSchema?.blocks || [])
      .filter((b) => b?.visible !== false)
      .map((b) => ({ kind: "block" as const, item: b, z: Number(b?.zIndex || 1) })),
    ...((layoutSchema?.elements || [])
      .filter((e) => e?.visible !== false)
      .map((e) => ({ kind: "element" as const, item: e, z: Number(e?.zIndex || 1) }))),
  ].sort((a, b) => a.z - b.z);

  return (
    <Card className="w-full border border-default-200/60 shadow-xl bg-white text-black">
      <CardBody className="p-4">
        <div className="w-full overflow-auto">
          <div
            className="relative mx-auto bg-white"
            style={{ width: pageW, height: pageH, boxShadow: "0 12px 36px rgba(0,0,0,0.12)" }}
          >
            {letterhead?.enabled && (
              <>
                <div className="absolute left-0 right-0 top-0 px-8 py-3 border-b border-default-200 text-[10px] opacity-70 z-[200]">
                  Letterhead: {letterhead?.name || "Preset"}
                </div>
                {letterhead?.watermark ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1] opacity-5 text-7xl font-black rotate-[-20deg]">
                    {letterhead.watermark}
                  </div>
                ) : null}
              </>
            )}

            {layers.map((layer) => {
              if (layer.kind === "block") {
                const block = layer.item as LayoutBlock;
                const isSelected = selectedBlockId === block.id;
                return (
                  <div
                    key={`block-${block.id}`}
                    onMouseDown={(e) => {
                      if (!editable) return;
                      onSelectBlock?.(block.id);
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const originX = Number(block.x || 0);
                      const originY = Number(block.y || 0);

                      const onMove = (ev: MouseEvent) => {
                        const dx = ev.clientX - startX;
                        const dy = ev.clientY - startY;
                        onBlockMove?.(block.id, Math.max(0, originX + dx), Math.max(0, originY + dy));
                      };
                      const onUp = () => {
                        window.removeEventListener("mousemove", onMove);
                        window.removeEventListener("mouseup", onUp);
                      };
                      window.addEventListener("mousemove", onMove);
                      window.addEventListener("mouseup", onUp);
                    }}
                    onClick={() => onSelectBlock?.(block.id)}
                    className={`absolute overflow-hidden rounded-md border bg-white/90 ${editable ? "cursor-move" : ""} ${isSelected ? "border-primary" : "border-default-200"}`}
                    style={{
                      left: block.x,
                      top: block.y,
                      width: block.width,
                      height: block.height,
                      padding: 8,
                      zIndex: layer.z + 10,
                      fontSize: block?.typography?.fontSize || 12,
                      fontWeight: block?.typography?.fontWeight || 500,
                      color: resolveTextColor(block?.typography?.color),
                      textAlign: block?.typography?.textAlign || "left",
                    }}
                  >
                    {renderContent(block, data, docLabel)}
                  </div>
                );
              }

              const el = layer.item as LayoutElement;
              return (
                <div
                  key={`element-${el.id}`}
                  className="absolute overflow-hidden"
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    zIndex: layer.z + 10,
                    fontSize: el?.typography?.fontSize || 12,
                    fontWeight: el?.typography?.fontWeight || 500,
                    color: resolveTextColor(el?.typography?.color),
                    textAlign: el?.typography?.textAlign || "left",
                    ...(el.style || {}),
                  }}
                >
                  {renderElement(el, data)}
                </div>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
