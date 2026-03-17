export type ParsedPhone = {
  e164: string;
  countryCode: string;
  national: string;
};

export const COMMON_DIAL_CODES = [
  { key: "+91", value: "+91 India" },
  { key: "+1", value: "+1 USA/Canada" },
  { key: "+7", value: "+7 Russia/Kazakhstan" },
  { key: "+20", value: "+20 Egypt" },
  { key: "+27", value: "+27 South Africa" },
  { key: "+30", value: "+30 Greece" },
  { key: "+31", value: "+31 Netherlands" },
  { key: "+32", value: "+32 Belgium" },
  { key: "+33", value: "+33 France" },
  { key: "+34", value: "+34 Spain" },
  { key: "+36", value: "+36 Hungary" },
  { key: "+39", value: "+39 Italy" },
  { key: "+40", value: "+40 Romania" },
  { key: "+41", value: "+41 Switzerland" },
  { key: "+43", value: "+43 Austria" },
  { key: "+44", value: "+44 UK" },
  { key: "+45", value: "+45 Denmark" },
  { key: "+46", value: "+46 Sweden" },
  { key: "+47", value: "+47 Norway" },
  { key: "+48", value: "+48 Poland" },
  { key: "+61", value: "+61 Australia" },
  { key: "+62", value: "+62 Indonesia" },
  { key: "+63", value: "+63 Philippines" },
  { key: "+64", value: "+64 New Zealand" },
  { key: "+65", value: "+65 Singapore" },
  { key: "+66", value: "+66 Thailand" },
  { key: "+81", value: "+81 Japan" },
  { key: "+82", value: "+82 South Korea" },
  { key: "+84", value: "+84 Vietnam" },
  { key: "+86", value: "+86 China" },
  { key: "+90", value: "+90 Turkey" },
  { key: "+92", value: "+92 Pakistan" },
  { key: "+93", value: "+93 Afghanistan" },
  { key: "+94", value: "+94 Sri Lanka" },
  { key: "+95", value: "+95 Myanmar" },
  { key: "+98", value: "+98 Iran" },
  { key: "+212", value: "+212 Morocco" },
  { key: "+213", value: "+213 Algeria" },
  { key: "+216", value: "+216 Tunisia" },
  { key: "+218", value: "+218 Libya" },
  { key: "+234", value: "+234 Nigeria" },
  { key: "+254", value: "+254 Kenya" },
  { key: "+255", value: "+255 Tanzania" },
  { key: "+256", value: "+256 Uganda" },
  { key: "+260", value: "+260 Zambia" },
  { key: "+263", value: "+263 Zimbabwe" },
  { key: "+351", value: "+351 Portugal" },
  { key: "+352", value: "+352 Luxembourg" },
  { key: "+353", value: "+353 Ireland" },
  { key: "+354", value: "+354 Iceland" },
  { key: "+355", value: "+355 Albania" },
  { key: "+356", value: "+356 Malta" },
  { key: "+357", value: "+357 Cyprus" },
  { key: "+358", value: "+358 Finland" },
  { key: "+359", value: "+359 Bulgaria" },
  { key: "+380", value: "+380 Ukraine" },
  { key: "+420", value: "+420 Czech Republic" },
  { key: "+421", value: "+421 Slovakia" },
  { key: "+880", value: "+880 Bangladesh" },
  { key: "+886", value: "+886 Taiwan" },
  { key: "+960", value: "+960 Maldives" },
  { key: "+961", value: "+961 Lebanon" },
  { key: "+962", value: "+962 Jordan" },
  { key: "+963", value: "+963 Syria" },
  { key: "+964", value: "+964 Iraq" },
  { key: "+965", value: "+965 Kuwait" },
  { key: "+966", value: "+966 Saudi Arabia" },
  { key: "+967", value: "+967 Yemen" },
  { key: "+968", value: "+968 Oman" },
  { key: "+970", value: "+970 Palestine" },
  { key: "+971", value: "+971 UAE" },
  { key: "+974", value: "+974 Qatar" },
  { key: "+975", value: "+975 Bhutan" },
  { key: "+976", value: "+976 Mongolia" },
  { key: "+977", value: "+977 Nepal" },
  { key: "+992", value: "+992 Tajikistan" },
  { key: "+993", value: "+993 Turkmenistan" },
  { key: "+994", value: "+994 Azerbaijan" },
  { key: "+995", value: "+995 Georgia" },
  { key: "+996", value: "+996 Kyrgyzstan" },
  { key: "+998", value: "+998 Uzbekistan" },
  { key: "+60", value: "+60 Malaysia" },
  { key: "+49", value: "+49 Germany" },
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
