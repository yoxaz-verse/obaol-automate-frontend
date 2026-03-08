type LanguageOption = {
  code: string;
  name: string;
  flag: string;
};

const ALL_LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "Arabic", flag: "🇦🇪" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", flag: "🇮🇳" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", flag: "🇮🇳" },
  { code: "or", name: "Odia", flag: "🇮🇳" },
  { code: "as", name: "Assamese", flag: "🇮🇳" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "tl", name: "Filipino", flag: "🇵🇭" },
  { code: "sw", name: "Swahili", flag: "🇰🇪" },
  { code: "zu", name: "Zulu", flag: "🇿🇦" },
  { code: "yo", name: "Yoruba", flag: "🇳🇬" },
  { code: "af", name: "Afrikaans", flag: "🇿🇦" },
  { code: "am", name: "Amharic", flag: "🇪🇹" },
];

// Keep this allowlist aligned with Google Translate supported language codes.
const GOOGLE_TRANSLATE_SUPPORTED_CODES = new Set<string>(
  ALL_LANGUAGE_OPTIONS.map((lang) => lang.code.toLowerCase())
);

export const languages: LanguageOption[] = ALL_LANGUAGE_OPTIONS.filter((lang) =>
  GOOGLE_TRANSLATE_SUPPORTED_CODES.has(lang.code.toLowerCase())
);

export const isLanguageSupported = (code: string): boolean =>
  GOOGLE_TRANSLATE_SUPPORTED_CODES.has(String(code || "").toLowerCase());

export const normalizeLanguageCode = (code: string): string =>
  isLanguageSupported(code) ? String(code).toLowerCase() : "en";

