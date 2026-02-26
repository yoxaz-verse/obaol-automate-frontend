"use client";

import React, { useEffect, useState } from "react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button,
} from "@nextui-org/react";
import { LuLanguages, LuChevronDown } from "react-icons/lu";

const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "Arabic", flag: "🇦🇪" },
    { code: "ta", name: "Tamil", flag: "🇮🇳" },
    { code: "ml", name: "Malayalam", flag: "🇮🇳" },
    { code: "kn", name: "Kannada", flag: "🇮🇳" },
    { code: "ur", name: "Urdu", flag: "🇮🇳" },
    { code: "pa", name: "Punjabi", flag: "🇮🇳" },
    { code: "raj", name: "Rajasthani", flag: "🇮🇳" },
    { code: "te", name: "Telugu", flag: "🇮🇳" },
    { code: "mr", name: "Marathi", flag: "🇮🇳" },
    { code: "gu", name: "Gujarati", flag: "🇮🇳" },
    { code: "bn", name: "Bengali", flag: "🇮🇳" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "de", name: "German", flag: "🇩🇪" },
];

declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        google: any;
    }
}

export const LanguageSwitcher = () => {
    const [currentLang, setCurrentLang] = useState("en");

    useEffect(() => {
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

        // Add the Google Translate script
        const addScript = document.createElement("script");
        addScript.id = "google-translate-script";
        addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(addScript);

        // Sync initial state from cookie
        const checkCookie = setInterval(() => {
            const googtrans = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
            if (googtrans) {
                const lang = googtrans.split('/').pop();
                if (lang && lang !== currentLang && languages.some(l => l.code === lang)) {
                    setCurrentLang(lang);
                    clearInterval(checkCookie);
                }
            }
        }, 1000);

        return () => clearInterval(checkCookie);
    }, []);

    const changeLanguage = (langCode: string) => {
        // Set cookies for all variations
        const domain = window.location.hostname;
        const cookieVal = `/en/${langCode}`;

        document.cookie = `googtrans=${cookieVal}; path=/`;
        document.cookie = `googtrans=${cookieVal}; path=/; domain=${domain}`;
        if (domain.includes(".")) {
            document.cookie = `googtrans=${cookieVal}; path=/; domain=.${domain}`;
        }

        // Trigger Google Translate engine
        const triggerGoogle = () => {
            const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
            if (select) {
                select.value = langCode;
                select.dispatchEvent(new Event("change"));
                setCurrentLang(langCode);
            } else {
                // If not ready, we might need a reload for the cookie to take effect
                console.log("Translation engine not ready, reloading...");
                window.location.reload();
            }
        };

        // Try triggering, or wait a bit if the script is still loading
        if (window.google && window.google.translate) {
            triggerGoogle();
        } else {
            console.log("Waiting for Google Translate to load...");
            setTimeout(triggerGoogle, 500);
        }
    };

    const currentLangName = languages.find((l) => l.code === currentLang)?.name || "Language";

    return (
        <div className="flex items-center">
            <div id="google_translate_element"></div>
            <Dropdown placement="bottom-end" classNames={{ content: "bg-content1 border border-default-200" }}>
                <DropdownTrigger>
                    <Button
                        variant="light"
                        radius="full"
                        className="flex items-center gap-2 px-3 min-w-[120px] bg-default-100/50 hover:bg-default-200/50 border border-transparent hover:border-default-200 transition-all font-medium text-xs h-10"
                    >
                        <LuLanguages className="text-warning-500 w-4 h-4" />
                        <span className="hidden sm:inline">{currentLangName}</span>
                        <LuChevronDown className="text-default-400 w-3 h-3" />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="Select Language"
                    className="max-h-[300px] overflow-y-auto"
                    onAction={(key) => changeLanguage(key as string)}
                >
                    {languages.map((lang) => (
                        <DropdownItem
                            key={lang.code}
                            startContent={<span className="text-lg">{lang.flag}</span>}
                            className={currentLang === lang.code ? "text-warning-500 font-bold" : "text-foreground"}
                        >
                            {lang.name}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        </div>
    );
};
