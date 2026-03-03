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
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-background backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-8 p-12 rounded-[40px] bg-content1 border border-default-200 shadow-2xl scale-in-center max-w-[90vw] backdrop-blur-xl">
                <div className="relative">
                    <LuLanguages className="text-warning-500 w-24 h-24 relative" />
                    <div className="absolute inset-0 bg-warning-500/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
                </div>
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black tracking-tight text-foreground uppercase italic underline decoration-warning-500 selection:bg-warning-500/30">Translating</h2>
                    <p className="text-2xl text-default-600 font-bold">
                        Optimizing for <span className="text-warning-500 font-black decoration-warning-500/30 underline-offset-[12px]">{targetLang}</span>
                    </p>
                </div>
                <div className="w-80 h-2 bg-default-100 rounded-full overflow-hidden border border-default-200 shadow-inner">
                    <div className="h-full bg-warning-500 animate-progress origin-left shadow-[0_0_20px_rgba(251,146,60,0.5)]"></div>
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
