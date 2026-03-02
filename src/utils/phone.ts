export type ParsedPhone = {
  e164: string;
  countryCode: string;
  national: string;
};

export const COMMON_DIAL_CODES = [
  { key: "+91", value: "India (+91)" },
  { key: "+1", value: "USA/Canada (+1)" },
  { key: "+7", value: "Russia/Kazakhstan (+7)" },
  { key: "+20", value: "Egypt (+20)" },
  { key: "+27", value: "South Africa (+27)" },
  { key: "+30", value: "Greece (+30)" },
  { key: "+31", value: "Netherlands (+31)" },
  { key: "+32", value: "Belgium (+32)" },
  { key: "+33", value: "France (+33)" },
  { key: "+34", value: "Spain (+34)" },
  { key: "+36", value: "Hungary (+36)" },
  { key: "+39", value: "Italy (+39)" },
  { key: "+40", value: "Romania (+40)" },
  { key: "+41", value: "Switzerland (+41)" },
  { key: "+43", value: "Austria (+43)" },
  { key: "+44", value: "UK (+44)" },
  { key: "+45", value: "Denmark (+45)" },
  { key: "+46", value: "Sweden (+46)" },
  { key: "+47", value: "Norway (+47)" },
  { key: "+48", value: "Poland (+48)" },
  { key: "+61", value: "Australia (+61)" },
  { key: "+62", value: "Indonesia (+62)" },
  { key: "+63", value: "Philippines (+63)" },
  { key: "+64", value: "New Zealand (+64)" },
  { key: "+65", value: "Singapore (+65)" },
  { key: "+66", value: "Thailand (+66)" },
  { key: "+81", value: "Japan (+81)" },
  { key: "+82", value: "South Korea (+82)" },
  { key: "+84", value: "Vietnam (+84)" },
  { key: "+86", value: "China (+86)" },
  { key: "+90", value: "Turkey (+90)" },
  { key: "+92", value: "Pakistan (+92)" },
  { key: "+93", value: "Afghanistan (+93)" },
  { key: "+94", value: "Sri Lanka (+94)" },
  { key: "+95", value: "Myanmar (+95)" },
  { key: "+98", value: "Iran (+98)" },
  { key: "+212", value: "Morocco (+212)" },
  { key: "+213", value: "Algeria (+213)" },
  { key: "+216", value: "Tunisia (+216)" },
  { key: "+218", value: "Libya (+218)" },
  { key: "+234", value: "Nigeria (+234)" },
  { key: "+254", value: "Kenya (+254)" },
  { key: "+255", value: "Tanzania (+255)" },
  { key: "+256", value: "Uganda (+256)" },
  { key: "+260", value: "Zambia (+260)" },
  { key: "+263", value: "Zimbabwe (+263)" },
  { key: "+351", value: "Portugal (+351)" },
  { key: "+352", value: "Luxembourg (+352)" },
  { key: "+353", value: "Ireland (+353)" },
  { key: "+354", value: "Iceland (+354)" },
  { key: "+355", value: "Albania (+355)" },
  { key: "+356", value: "Malta (+356)" },
  { key: "+357", value: "Cyprus (+357)" },
  { key: "+358", value: "Finland (+358)" },
  { key: "+359", value: "Bulgaria (+359)" },
  { key: "+380", value: "Ukraine (+380)" },
  { key: "+420", value: "Czech Republic (+420)" },
  { key: "+421", value: "Slovakia (+421)" },
  { key: "+880", value: "Bangladesh (+880)" },
  { key: "+886", value: "Taiwan (+886)" },
  { key: "+960", value: "Maldives (+960)" },
  { key: "+961", value: "Lebanon (+961)" },
  { key: "+962", value: "Jordan (+962)" },
  { key: "+963", value: "Syria (+963)" },
  { key: "+964", value: "Iraq (+964)" },
  { key: "+965", value: "Kuwait (+965)" },
  { key: "+966", value: "Saudi Arabia (+966)" },
  { key: "+967", value: "Yemen (+967)" },
  { key: "+968", value: "Oman (+968)" },
  { key: "+970", value: "Palestine (+970)" },
  { key: "+971", value: "UAE (+971)" },
  { key: "+974", value: "Qatar (+974)" },
  { key: "+975", value: "Bhutan (+975)" },
  { key: "+976", value: "Mongolia (+976)" },
  { key: "+977", value: "Nepal (+977)" },
  { key: "+992", value: "Tajikistan (+992)" },
  { key: "+993", value: "Turkmenistan (+993)" },
  { key: "+994", value: "Azerbaijan (+994)" },
  { key: "+995", value: "Georgia (+995)" },
  { key: "+996", value: "Kyrgyzstan (+996)" },
  { key: "+998", value: "Uzbekistan (+998)" },
  { key: "+60", value: "Malaysia (+60)" },
  { key: "+49", value: "Germany (+49)" },
];

const toStr = (v: any) => String(v ?? "").trim();
const digitsOnly = (v: any) => toStr(v).replace(/\D/g, "");

export const normalizeDialCode = (v: any, fallback = "+91"): string => {
  const s = toStr(v).replace(/[^\d+]/g, "");
  if (!s) return fallback;
  if (s.startsWith("+")) return s;
  return `+${s}`;
};

export const parsePhoneValue = (input: {
  raw?: any;
  countryCode?: any;
  national?: any;
  fallbackCountryCode?: string;
}): ParsedPhone => {
  const fallback = normalizeDialCode(input.fallbackCountryCode || "+91");
  const explicitCC = normalizeDialCode(input.countryCode, fallback);
  const explicitNational = digitsOnly(input.national);
  const raw = toStr(input.raw);

  if (explicitNational) {
    return {
      e164: `${explicitCC}${explicitNational}`,
      countryCode: explicitCC,
      national: explicitNational,
    };
  }

  if (raw.startsWith("+")) {
    const compact = `+${raw.slice(1).replace(/\D/g, "")}`;
    for (let len = 3; len >= 1; len--) {
      const cc = compact.slice(0, len + 1);
      const national = compact.slice(len + 1);
      if (national.length >= 4) {
        return { e164: `${cc}${national}`, countryCode: cc, national };
      }
    }
  }

  const national = digitsOnly(raw);
  if (!national) return { e164: "", countryCode: explicitCC, national: "" };
  return {
    e164: `${explicitCC}${national}`,
    countryCode: explicitCC,
    national,
  };
};

export const phoneMetaKeys = (baseKey: string) => {
  const first = baseKey.charAt(0).toUpperCase() + baseKey.slice(1);
  return {
    countryCode: `${baseKey}CountryCode`,
    national: `${baseKey}National`,
    secondaryCountryCode: `phoneSecondaryCountryCode`,
    secondaryNational: `phoneSecondaryNational`,
    displayCountryCode: `${first}CountryCode`,
    displayNational: `${first}National`,
  };
};
