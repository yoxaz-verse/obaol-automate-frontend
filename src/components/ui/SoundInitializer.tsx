"use client";

/**
 * SoundInitializer — Global click sound handler for the dashboard.
 * Uses event delegation to detect button/tab/toggle clicks and play
 * the appropriate sound without modifying every individual component.
 */
import { useEffect } from "react";
import { useSoundEffect } from "@/context/SoundContext";

export default function SoundInitializer() {
    const { play } = useSoundEffect();

    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Walk up to find a meaningful interactive element
            const interactable = target.closest<HTMLElement>(
                "button, [role='tab'], [role='switch'], [data-sound]"
            );
            if (!interactable) return;

            // Skip the Sidebar — it has its own sound handler
            if (interactable.closest("[data-sidebar]")) return;

            // Determine sound type from attributes or element type
            const soundAttr = interactable.getAttribute("data-sound") as any;
            if (soundAttr) {
                play(soundAttr);
                return;
            }

            const role = interactable.getAttribute("role");

            if (role === "tab") {
                play("tab");
                return;
            }

            if (role === "switch") {
                play("toggle");
                return;
            }

            if (interactable.tagName === "BUTTON") {
                // Classify button by color/class hints
                const cls = interactable.className || "";
                const isDelete =
                    cls.includes("danger") ||
                    cls.includes("error") ||
                    interactable.textContent?.toLowerCase().includes("delete") ||
                    interactable.textContent?.toLowerCase().includes("remove");

                const isSuccess =
                    cls.includes("success") ||
                    interactable.textContent?.toLowerCase().includes("publish") ||
                    interactable.textContent?.toLowerCase().includes("submit") ||
                    interactable.textContent?.toLowerCase().includes("save") ||
                    interactable.textContent?.toLowerCase().includes("add to inventory") ||
                    interactable.textContent?.toLowerCase().includes("confirm");

                const isModal =
                    interactable.getAttribute("aria-haspopup") === "dialog" ||
                    interactable.closest("[role='dialog']") !== null;

                if (isDelete) {
                    play("danger");
                } else if (isSuccess) {
                    play("success");
                } else if (isModal) {
                    play("modal");
                } else {
                    play("click");
                }
            }
        };

        document.addEventListener("click", handleGlobalClick, { capture: true });
        return () => {
            document.removeEventListener("click", handleGlobalClick, { capture: true });
        };
    }, [play]);

    return null;
}
