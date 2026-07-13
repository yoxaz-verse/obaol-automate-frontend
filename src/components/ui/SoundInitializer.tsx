"use client";

/**
 * SoundInitializer — Site-wide OBAOL interaction sound handler.
 * Uses event delegation so shared controls, links, tabs, and marked
 * workflow cards get tactile feedback without per-component wiring.
 */
import { useEffect, useRef } from "react";
import { useSoundEffect } from "@/context/SoundContext";
import type { SoundType } from "@/utils/sounds";

const INTERACTIVE_SELECTOR = [
    "button",
    "a[href]",
    "[role='button']",
    "[role='link']",
    "[role='tab']",
    "[role='switch']",
    "[role='menuitem']",
    "[data-sound]",
    "[data-interactive='true']",
    "[data-process]",
    "[data-process-step]",
    "[data-workflow]",
    "[data-workflow-step]",
].join(", ");

const SOUND_TYPES: readonly SoundType[] = [
    "nav",
    "tab",
    "click",
    "success",
    "danger",
    "toggle",
    "modal",
    "cash",
    "language",
];

function isSoundType(value: string | null): value is SoundType {
    return Boolean(value && SOUND_TYPES.includes(value as SoundType));
}

function isDisabled(interactable: HTMLElement): boolean {
    if (interactable.hasAttribute("disabled")) return true;
    if (interactable.getAttribute("aria-disabled") === "true") return true;
    if (interactable.getAttribute("data-disabled") === "true") return true;
    if (interactable.matches(":disabled")) return true;
    return String(interactable.className || "").includes("cursor-not-allowed");
}

function textOf(interactable: HTMLElement): string {
    return (interactable.getAttribute("aria-label") || interactable.textContent || "").toLowerCase();
}

function classifyInteraction(interactable: HTMLElement): SoundType | null {
    const soundAttr = interactable.getAttribute("data-sound");
    if (soundAttr === "none" || soundAttr === "off" || soundAttr === "silent") return null;
    if (isSoundType(soundAttr)) return soundAttr;

    const role = interactable.getAttribute("role");
    if (role === "tab") return "tab";
    if (role === "switch") return "toggle";
    if (role === "menuitem") return "nav";

    const tag = interactable.tagName;
    const href = interactable.getAttribute("href");
    const label = textOf(interactable);
    const cls = String(interactable.className || "").toLowerCase();

    const opensModal =
        interactable.getAttribute("aria-haspopup") === "dialog" ||
        interactable.getAttribute("data-modal") === "true";

    if (opensModal) return "modal";

    if (
        cls.includes("danger") ||
        cls.includes("error") ||
        label.includes("delete") ||
        label.includes("remove") ||
        label.includes("terminate")
    ) {
        return "danger";
    }

    if (
        cls.includes("success") ||
        label.includes("publish") ||
        label.includes("submit") ||
        label.includes("save") ||
        label.includes("confirm") ||
        label.includes("complete")
    ) {
        return "success";
    }

    if (href || tag === "A" || role === "link") return "nav";
    if (interactable.hasAttribute("data-process") || interactable.hasAttribute("data-process-step")) return "tab";
    if (interactable.hasAttribute("data-workflow") || interactable.hasAttribute("data-workflow-step")) return "tab";

    return "click";
}

export default function SoundInitializer() {
    const { play } = useSoundEffect();
    const lastPlayedRef = useRef<{ at: number; element: HTMLElement | null; type: SoundType | null }>({
        at: 0,
        element: null,
        type: null,
    });

    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target?.closest) return;

            // Walk up to find a meaningful interactive element
            const interactable = target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
            if (!interactable) return;
            if (isDisabled(interactable)) return;

            // Sidebar already plays a route tone from its own navigation handler.
            if (interactable.closest("[data-sidebar]")) return;

            const soundType = classifyInteraction(interactable);
            if (!soundType) return;

            const now = performance.now();
            const last = lastPlayedRef.current;
            if (last.element === interactable && last.type === soundType && now - last.at < 90) return;

            lastPlayedRef.current = { at: now, element: interactable, type: soundType };
            play(soundType);
        };

        document.addEventListener("click", handleGlobalClick, { capture: true });
        return () => {
            document.removeEventListener("click", handleGlobalClick, { capture: true });
        };
    }, [play]);

    return null;
}
