"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

type RevealImageProps = ImageProps & { revealClassName?: string };
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'%3E%3Crect width='640' height='480' fill='%23eeeae2'/%3E%3Cpath d='M200 300l80-90 60 64 42-48 68 74' fill='none' stroke='%23b6aa98' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='395' cy='180' r='22' fill='%23b6aa98'/%3E%3C/svg%3E";

/** Keeps the caller's image dimensions and layout while waiting for decoded pixels. */
export default function RevealImage({ src, className = "", revealClassName = "", onLoadingComplete, onError, ...props }: RevealImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const sourceKey = typeof src === "string" ? src : "src" in src ? src.src : src.default.src;
  const visible = loadedSrc === sourceKey || failedSrc === sourceKey;

  return (
    <Image
      {...props}
      src={failedSrc === sourceKey ? FALLBACK_IMAGE : src}
      className={`reveal-image ${visible ? "reveal-image--visible" : ""} ${revealClassName} ${className}`}
      onLoadingComplete={(image) => {
        setLoadedSrc(sourceKey);
        onLoadingComplete?.(image);
      }}
      onError={(event) => {
        setFailedSrc(sourceKey);
        onError?.(event);
      }}
    />
  );
}

type RevealNativeImageProps = ImgHTMLAttributes<HTMLImageElement>;

export function RevealNativeImage({ src, className = "", onLoad, onError, ...props }: RevealNativeImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const visible = loadedSrc === src || failedSrc === src;

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setLoadedSrc(src ?? null);
  }, [src]);

  return (
    <img
      {...props}
      ref={imageRef}
      src={failedSrc === src ? FALLBACK_IMAGE : src}
      className={`reveal-image ${visible ? "reveal-image--visible" : ""} ${className}`}
      onLoad={(event) => {
        setLoadedSrc(src ?? null);
        onLoad?.(event);
      }}
      onError={(event) => {
        setFailedSrc(src ?? null);
        onError?.(event);
      }}
    />
  );
}
