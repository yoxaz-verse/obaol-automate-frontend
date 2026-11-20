"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Slider } from "@nextui-org/react";
import { FiRotateCcw } from "react-icons/fi";
import { IMAGE_PRESETS, extensionForMimeType, type ImagePresetName } from "./imagePresets";

type Props = {
  file: File | null;
  preset: ImagePresetName;
  isOpen: boolean;
  onCancel: () => void;
  onSave: (file: File) => void;
};

const loadImage = (source: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = source;
});

export default function ImageCropDialog({ file, preset, isOpen, onCancel, onSave }: Props) {
  const config = IMAGE_PRESETS[preset];
  const [source, setSource] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const drag = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    if (!file) { setSource(""); return; }
    const next = URL.createObjectURL(file);
    setSource(next); setZoom(1); setOffsetX(0); setOffsetY(0); setRotation(0);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  const frameStyle = useMemo(() => ({ aspectRatio: String(config.aspect), maxWidth: config.aspect > 2 ? 520 : 360 }), [config.aspect]);

  const save = async () => {
    if (!source || !file) return;
    setBusy(true); setError("");
    try {
      const image = await loadImage(source);
      const turns = ((rotation % 360) + 360) % 360;
      const rotated = turns === 90 || turns === 270;
      const imageWidth = rotated ? image.naturalHeight : image.naturalWidth;
      const imageHeight = rotated ? image.naturalWidth : image.naturalHeight;
      const baseCropWidth = Math.min(imageWidth, imageHeight * config.aspect);
      const baseCropHeight = baseCropWidth / config.aspect;
      const cropWidth = baseCropWidth / zoom;
      const cropHeight = baseCropHeight / zoom;
      const maxX = Math.max(0, (imageWidth - cropWidth) / 2);
      const maxY = Math.max(0, (imageHeight - cropHeight) / 2);
      const centerX = imageWidth / 2 + (offsetX / 100) * maxX;
      const centerY = imageHeight / 2 + (offsetY / 100) * maxY;

      const rotatedCanvas = document.createElement("canvas");
      rotatedCanvas.width = imageWidth; rotatedCanvas.height = imageHeight;
      const rotatedContext = rotatedCanvas.getContext("2d");
      if (!rotatedContext) throw new Error("Image processing is unavailable.");
      rotatedContext.translate(imageWidth / 2, imageHeight / 2);
      rotatedContext.rotate((turns * Math.PI) / 180);
      rotatedContext.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

      const output = document.createElement("canvas");
      output.width = config.width; output.height = config.height;
      const context = output.getContext("2d");
      if (!context) throw new Error("Image processing is unavailable.");
      if (!config.transparent) { context.fillStyle = "#ffffff"; context.fillRect(0, 0, output.width, output.height); }
      if (config.fit === "contain") {
        const scale = Math.min(output.width / imageWidth, output.height / imageHeight) * zoom;
        const drawWidth = imageWidth * scale;
        const drawHeight = imageHeight * scale;
        const x = (output.width - drawWidth) / 2 + (offsetX / 100) * Math.max(0, output.width - drawWidth) / 2;
        const y = (output.height - drawHeight) / 2 + (offsetY / 100) * Math.max(0, output.height - drawHeight) / 2;
        context.drawImage(rotatedCanvas, x, y, drawWidth, drawHeight);
      } else {
        context.drawImage(rotatedCanvas, centerX - cropWidth / 2, centerY - cropHeight / 2, cropWidth, cropHeight, 0, 0, output.width, output.height);
      }
      const blob = await new Promise<Blob>((resolve, reject) => output.toBlob(value => value ? resolve(value) : reject(new Error("Image export failed.")), config.mimeType, config.quality));
      const baseName = file.name.replace(/\.[^.]+$/, "") || preset;
      onSave(new File([blob], `${baseName}.${extensionForMimeType(config.mimeType)}`, { type: config.mimeType, lastModified: Date.now() }));
    } catch (cause: any) { setError(cause?.message || "The image could not be processed."); } finally { setBusy(false); }
  };

  const reset = () => { setZoom(1); setOffsetX(0); setOffsetY(0); setRotation(0); };
  const dirty = zoom !== 1 || offsetX !== 0 || offsetY !== 0 || rotation !== 0;
  const requestCancel = () => { if (!busy && (!dirty || window.confirm("Discard the image adjustments?"))) onCancel(); };
  const startDrag = (event: PointerEvent<HTMLDivElement>) => { drag.current = { x: event.clientX, y: event.clientY, offsetX, offsetY }; event.currentTarget.setPointerCapture(event.pointerId); };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => { if (!drag.current) return; const bounds = event.currentTarget.getBoundingClientRect(); setOffsetX(Math.max(-100, Math.min(100, drag.current.offsetX + ((event.clientX - drag.current.x) / bounds.width) * 200))); setOffsetY(Math.max(-100, Math.min(100, drag.current.offsetY + ((event.clientY - drag.current.y) / bounds.height) * 200))); };
  const stopDrag = () => { drag.current = null; };
  return <Modal isOpen={isOpen} onClose={requestCancel} size="2xl" scrollBehavior="inside">
    <ModalContent><ModalHeader>Crop and optimize image</ModalHeader><ModalBody className="gap-4">
      <div className="mx-auto w-full touch-none cursor-move overflow-hidden rounded-2xl bg-default-100" style={frameStyle} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
        {source ? <>{/* eslint-disable-next-line @next/next/no-img-element -- local blob preview must reflect live canvas transforms */}<img src={source} alt="Crop preview" className={`h-full w-full ${config.fit === "contain" ? "object-contain" : "object-cover"}`} style={{ transform: `translate(${offsetX / 2}%, ${offsetY / 2}%) scale(${zoom}) rotate(${rotation}deg)` }} /></> : null}
      </div>
      <Slider label="Zoom" minValue={1} maxValue={3} step={0.05} value={zoom} onChange={value => setZoom(Number(value))} />
      <div className="grid gap-3 sm:grid-cols-2"><Slider label="Horizontal position" minValue={-100} maxValue={100} value={offsetX} onChange={value => setOffsetX(Number(value))} /><Slider label="Vertical position" minValue={-100} maxValue={100} value={offsetY} onChange={value => setOffsetY(Number(value))} /></div>
      <div className="flex flex-wrap items-center gap-2">{config.allowRotation ? <Button size="sm" variant="flat" onPress={() => setRotation(value => (value + 90) % 360)}>Rotate 90°</Button> : null}<Button size="sm" variant="light" startContent={<FiRotateCcw />} onPress={reset}>Reset</Button></div>
      <p className="text-xs text-default-500">Saved as {config.width} × {config.height} {config.mimeType.replace("image/", "").toUpperCase()}.</p>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
    </ModalBody><ModalFooter><Button variant="light" isDisabled={busy} onPress={requestCancel}>Cancel</Button><Button color="warning" isLoading={busy} onPress={save}>Use image</Button></ModalFooter></ModalContent>
  </Modal>;
}
