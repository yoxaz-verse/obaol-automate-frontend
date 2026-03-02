"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuLanguages } from "react-icons/lu";
import { languages } from "@/data/languages";

declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        google: any;
    }
}

export const TranslationEngine = () => {
    const [isSwitching, setIsSwitching] = useState(false);
    const [targetLang, setTargetLang] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleStart = (e: any) => {
            setTargetLang(e.detail.name);
            setIsSwitching(true);
        };
        const handleEnd = () => setIsSwitching(false);

        window.addEventListener("translation-start", handleStart);
        window.addEventListener("translation-end", handleEnd);

        // Define the Google Translate initialization function
        window.googleTranslateElementInit = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: "en",
                        includedLanguages: languages.map((l) => l.code).join(","),
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false,
                    },
                    "google_translate_element"
                );
            }
        };

        // Add the Google Translate script if not present
        if (!document.getElementById("google-translate-script")) {
            const addScript = document.createElement("script");
            addScript.id = "google-translate-script";
            addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            document.body.appendChild(addScript);
        }

        // Apply styles to hide Google Translate UI
        const style = document.createElement("style");
        style.innerHTML = `
            body {
                top: 0 !important;
                position: static !important;
            }
            iframe.skiptranslate {
                display: none !important;
            }
            .goog-te-banner-frame {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            window.removeEventListener("translation-start", handleStart);
            window.removeEventListener("translation-end", handleEnd);
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    const overlay = isSwitching ? (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-background/40 backdrop-blur-2xl animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-8 p-12 rounded-[40px] bg-content1/80 border border-default-200/50 shadow-sm scale-in-center max-w-[90vw] backdrop-blur-xl">
                <div className="relative">
                    <LuLanguages className="text-warning-500 w-20 h-20 relative" />
                </div>
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">Translating</h2>
                    <p className="text-xl text-default-600 font-medium">
                        Optimizing experience for <span className="text-warning-500 font-bold underline decoration-warning-500/30 underline-offset-8">{targetLang}</span>
                    </p>
                </div>
                <div className="w-64 h-1.5 bg-default-100 rounded-full overflow-hidden border border-default-200/50">
                    <div className="h-full bg-warning-500 animate-progress origin-left"></div>
                </div>
            </div>
            <style>{`
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
                .animate-progress {
                    animation: progress 3s cubic-bezier(0.65, 0, 0.35, 1) forwards;
                }
                .scale-in-center {
                    animation: scale-in-center 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
                }
                @keyframes scale-in-center {
                    0% { transform: scale(0.5); opacity: 0; filter: blur(10px); }
                    100% { transform: scale(1); opacity: 1; filter: blur(0); }
                }
            `}</style>
        </div>
    ) : null;

    if (!mounted) return <div id="google_translate_element" className="hidden" aria-hidden="true"></div>;

    return (
        <>
            <div id="google_translate_element" className="hidden" aria-hidden="true"></div>
            {mounted && overlay && createPortal(overlay, document.body)}
        </>
    );
};
