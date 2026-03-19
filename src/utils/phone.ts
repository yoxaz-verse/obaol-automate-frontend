export type ParsedPhone = {
  e164: string;
  countryCode: string;
  national: string;
};

export const COMMON_DIAL_CODES = [
  { key: "+91", value: "+91" },
  { key: "+1", value: "+1" },
  { key: "+7", value: "+7" },
  { key: "+20", value: "+20" },
  { key: "+27", value: "+27" },
  { key: "+30", value: "+30" },
  { key: "+31", value: "+31" },
  { key: "+32", value: "+32" },
  { key: "+33", value: "+33" },
  { key: "+34", value: "+34" },
  { key: "+36", value: "+36" },
  { key: "+39", value: "+39" },
  { key: "+40", value: "+40" },
  { key: "+41", value: "+41" },
  { key: "+43", value: "+43" },
  { key: "+44", value: "+44" },
  { key: "+45", value: "+45" },
  { key: "+46", value: "+46" },
  { key: "+47", value: "+47" },
  { key: "+48", value: "+48" },
  { key: "+61", value: "+61" },
  { key: "+62", value: "+62" },
  { key: "+63", value: "+63" },
  { key: "+64", value: "+64" },
  { key: "+65", value: "+65" },
  { key: "+66", value: "+66" },
  { key: "+81", value: "+81" },
  { key: "+82", value: "+82" },
  { key: "+84", value: "+84" },
  { key: "+86", value: "+86" },
  { key: "+90", value: "+90" },
  { key: "+92", value: "+92" },
  { key: "+93", value: "+93" },
  { key: "+94", value: "+94" },
  { key: "+95", value: "+95" },
  { key: "+98", value: "+98" },
  { key: "+212", value: "+212" },
  { key: "+213", value: "+213" },
  { key: "+216", value: "+216" },
  { key: "+218", value: "+218" },
  { key: "+234", value: "+234" },
  { key: "+254", value: "+254" },
  { key: "+255", value: "+255" },
  { key: "+256", value: "+256" },
  { key: "+260", value: "+260" },
  { key: "+263", value: "+263" },
  { key: "+351", value: "+351" },
  { key: "+352", value: "+352" },
  { key: "+353", value: "+353" },
  { key: "+354", value: "+354" },
  { key: "+355", value: "+355" },
  { key: "+356", value: "+356" },
  { key: "+357", value: "+357" },
  { key: "+358", value: "+358" },
  { key: "+359", value: "+359" },
  { key: "+380", value: "+380" },
  { key: "+420", value: "+420" },
  { key: "+421", value: "+421" },
  { key: "+880", value: "+880" },
  { key: "+886", value: "+886" },
  { key: "+960", value: "+960" },
  { key: "+961", value: "+961" },
  { key: "+962", value: "+962" },
  { key: "+963", value: "+963" },
  { key: "+964", value: "+964" },
  { key: "+965", value: "+965" },
  { key: "+966", value: "+966" },
  { key: "+967", value: "+967" },
  { key: "+968", value: "+968" },
  { key: "+970", value: "+970" },
  { key: "+971", value: "+971" },
  { key: "+974", value: "+974" },
  { key: "+975", value: "+975" },
  { key: "+976", value: "+976" },
  { key: "+977", value: "+977" },
  { key: "+992", value: "+992" },
  { key: "+993", value: "+993" },
  { key: "+994", value: "+994" },
  { key: "+995", value: "+995" },
  { key: "+996", value: "+996" },
  { key: "+998", value: "+998" },
  { key: "+60", value: "+60" },
  { key: "+49", value: "+49" },
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
