import { IconType } from "react-icons";
import { FiShield, FiDroplet, FiAward, FiPackage, FiCheckSquare } from "react-icons/fi";

export type ClassificationKey = "conventional" | "natural" | "organic" | "ipm-quality" | "gi-tag";

export type ClassificationTheme = {
  key: ClassificationKey;
  label: string;
  priority: number;
  icon: IconType;
  iconClass: string;
  watermarkIconClass: string;
  watermarkOpacityClass: string;
  watermarkSizeClass: string;
  watermarkPositionClass: string;
  watermarkBlurClass: string;
  pageWashClass: string;
  pageWashOverlayClass: string;
  pageGlowA: string;
  pageGlowB: string;
  shellClass: string;
  shellBorderClass: string;
  headingAccentClass: string;
  chipActiveClass: string;
  chipIdleClass: string;
  tabActiveClass: string;
  tabIdleClass: string;
  tabPillActiveClass: string;
  tabPillIdleClass: string;
  tabIconActiveClass: string;
  tabIconIdleClass: string;
  headerStripeClass: string;
  cardOverlayClass: string;
  badgeClass: string;
};

const THEME_MAP: Record<ClassificationKey, ClassificationTheme> = {
  conventional: {
    key: "conventional",
    label: "Conventional",
    priority: 0,
    icon: FiPackage,
    iconClass: "text-default-300",
    watermarkIconClass: "text-default-400/45",
    watermarkOpacityClass: "opacity-[0.08]",
    watermarkSizeClass: "text-[36rem] md:text-[48rem] lg:text-[56rem]",
    watermarkPositionClass: "-top-28 -right-32 md:-top-36 md:-right-36 lg:-top-44 lg:-right-44",
    watermarkBlurClass: "blur-[1px]",
    pageWashClass: "bg-gradient-to-br from-default-500/14 via-default-400/8 to-warning-400/8",
    pageWashOverlayClass: "bg-gradient-to-b from-content1/5 via-content1/22 to-content1/40",
    pageGlowA: "bg-default-400/10",
    pageGlowB: "bg-default-500/5",
    shellClass: "bg-content1/85",
    shellBorderClass: "border-default-200",
    headingAccentClass: "text-warning-500",
    chipActiveClass: "bg-warning-500 text-black border-warning-400",
    chipIdleClass: "border-default-300/25 bg-default-500/10 text-default-200",
    tabActiveClass: "text-warning-500",
    tabIdleClass: "text-default-400",
    tabPillActiveClass: "bg-warning-500/15 border-warning-400/50 shadow-sm",
    tabPillIdleClass: "bg-transparent border-transparent hover:bg-default-500/10",
    tabIconActiveClass: "text-warning-500",
    tabIconIdleClass: "text-default-400",
    headerStripeClass: "from-default-400/50 via-warning-400/35 to-transparent",
    cardOverlayClass: "from-default-500/10 via-transparent to-transparent",
    badgeClass: "bg-default-500/15 text-default-300 border-default-300/30",
  },
  natural: {
    key: "natural",
    label: "Natural",
    priority: 1,
    icon: FiShield,
    iconClass: "text-amber-300",
    watermarkIconClass: "text-amber-500/45",
    watermarkOpacityClass: "opacity-[0.09]",
    watermarkSizeClass: "text-[36rem] md:text-[48rem] lg:text-[56rem]",
    watermarkPositionClass: "-top-28 -right-32 md:-top-36 md:-right-36 lg:-top-44 lg:-right-44",
    watermarkBlurClass: "blur-[1px]",
    pageWashClass: "bg-gradient-to-br from-amber-500/18 via-lime-500/10 to-content1/5",
    pageWashOverlayClass: "bg-gradient-to-b from-content1/5 via-content1/20 to-content1/38",
    pageGlowA: "bg-amber-500/15",
    pageGlowB: "bg-lime-500/10",
    shellClass: "bg-gradient-to-br from-amber-500/5 via-content1/90 to-lime-500/5",
    shellBorderClass: "border-amber-500/30",
    headingAccentClass: "text-amber-500",
    chipActiveClass: "bg-amber-500/90 text-black border-amber-400",
    chipIdleClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    tabActiveClass: "text-amber-400",
    tabIdleClass: "text-default-400",
    tabPillActiveClass: "bg-amber-500/16 border-amber-400/45 shadow-sm",
    tabPillIdleClass: "bg-transparent border-transparent hover:bg-default-500/10",
    tabIconActiveClass: "text-amber-500",
    tabIconIdleClass: "text-default-400",
    headerStripeClass: "from-amber-500/65 via-lime-400/35 to-transparent",
    cardOverlayClass: "from-amber-500/18 via-lime-500/10 to-transparent",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/35",
  },
  organic: {
    key: "organic",
    label: "Organic",
    priority: 2,
    icon: FiDroplet,
    iconClass: "text-emerald-300",
    watermarkIconClass: "text-emerald-500/45",
    watermarkOpacityClass: "opacity-[0.1]",
    watermarkSizeClass: "text-[36rem] md:text-[48rem] lg:text-[56rem]",
    watermarkPositionClass: "-top-28 -right-32 md:-top-36 md:-right-36 lg:-top-44 lg:-right-44",
    watermarkBlurClass: "blur-[1px]",
    pageWashClass: "bg-gradient-to-br from-emerald-500/20 via-green-500/12 to-content1/6",
    pageWashOverlayClass: "bg-gradient-to-b from-content1/5 via-content1/18 to-content1/36",
    pageGlowA: "bg-emerald-500/20",
    pageGlowB: "bg-green-500/12",
    shellClass: "bg-gradient-to-br from-emerald-500/10 via-content1/90 to-green-500/10",
    shellBorderClass: "border-emerald-500/35",
    headingAccentClass: "text-emerald-400",
    chipActiveClass: "bg-emerald-500/90 text-black border-emerald-300",
    chipIdleClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    tabActiveClass: "text-emerald-400",
    tabIdleClass: "text-default-400",
    tabPillActiveClass: "bg-emerald-500/16 border-emerald-400/45 shadow-sm",
    tabPillIdleClass: "bg-transparent border-transparent hover:bg-default-500/10",
    tabIconActiveClass: "text-emerald-500",
    tabIconIdleClass: "text-default-400",
    headerStripeClass: "from-emerald-500/70 via-green-400/35 to-transparent",
    cardOverlayClass: "from-emerald-500/20 via-green-500/10 to-transparent",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
  },
  "ipm-quality": {
    key: "ipm-quality",
    label: "IPM Quality",
    priority: 0,
    icon: FiCheckSquare,
    iconClass: "text-sky-300",
    watermarkIconClass: "text-sky-500/45",
    watermarkOpacityClass: "opacity-[0.08]",
    watermarkSizeClass: "text-[36rem] md:text-[48rem] lg:text-[56rem]",
    watermarkPositionClass: "-top-28 -right-32 md:-top-36 md:-right-36 lg:-top-44 lg:-right-44",
    watermarkBlurClass: "blur-[1px]",
    pageWashClass: "bg-gradient-to-br from-sky-500/18 via-cyan-500/10 to-content1/5",
    pageWashOverlayClass: "bg-gradient-to-b from-content1/5 via-content1/20 to-content1/38",
    pageGlowA: "bg-sky-500/15",
    pageGlowB: "bg-cyan-500/10",
    shellClass: "bg-gradient-to-br from-sky-500/8 via-content1/90 to-cyan-500/8",
    shellBorderClass: "border-sky-500/30",
    headingAccentClass: "text-sky-400",
    chipActiveClass: "bg-sky-500/90 text-black border-sky-300",
    chipIdleClass: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    tabActiveClass: "text-sky-400",
    tabIdleClass: "text-default-400",
    tabPillActiveClass: "bg-sky-500/16 border-sky-400/45 shadow-sm",
    tabPillIdleClass: "bg-transparent border-transparent hover:bg-default-500/10",
    tabIconActiveClass: "text-sky-500",
    tabIconIdleClass: "text-default-400",
    headerStripeClass: "from-sky-500/70 via-cyan-400/35 to-transparent",
    cardOverlayClass: "from-sky-500/18 via-cyan-500/10 to-transparent",
    badgeClass: "bg-sky-500/15 text-sky-300 border-sky-400/35",
  },
  "gi-tag": {
    key: "gi-tag",
    label: "GI Tag",
    priority: 3,
    icon: FiAward,
    iconClass: "text-fuchsia-300",
    watermarkIconClass: "text-fuchsia-500/45",
    watermarkOpacityClass: "opacity-[0.1]",
    watermarkSizeClass: "text-[36rem] md:text-[48rem] lg:text-[56rem]",
    watermarkPositionClass: "-top-28 -right-32 md:-top-36 md:-right-36 lg:-top-44 lg:-right-44",
    watermarkBlurClass: "blur-[1px]",
    pageWashClass: "bg-gradient-to-br from-fuchsia-500/20 via-orange-500/12 to-content1/6",
    pageWashOverlayClass: "bg-gradient-to-b from-content1/5 via-content1/18 to-content1/36",
    pageGlowA: "bg-fuchsia-500/15",
    pageGlowB: "bg-orange-500/15",
    shellClass: "bg-gradient-to-br from-fuchsia-500/10 via-content1/90 to-orange-500/10",
    shellBorderClass: "border-fuchsia-400/35",
    headingAccentClass: "text-fuchsia-400",
    chipActiveClass: "bg-fuchsia-500/85 text-white border-fuchsia-300",
    chipIdleClass: "border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-300",
    tabActiveClass: "text-fuchsia-400",
    tabIdleClass: "text-default-400",
    tabPillActiveClass: "bg-fuchsia-500/16 border-fuchsia-400/45 shadow-sm",
    tabPillIdleClass: "bg-transparent border-transparent hover:bg-default-500/10",
    tabIconActiveClass: "text-fuchsia-500",
    tabIconIdleClass: "text-default-400",
    headerStripeClass: "from-fuchsia-500/70 via-orange-400/45 to-transparent",
    cardOverlayClass: "from-fuchsia-500/18 via-orange-500/12 to-transparent",
    badgeClass: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/35",
  },
};

export const CLASSIFICATION_OPTIONS = [
  { key: "conventional", label: "Conventional" },
  { key: "natural", label: "Natural" },
  { key: "organic", label: "Organic" },
  { key: "gi-tag", label: "GI Tag" },
] as const;

export const normalizeClassificationKey = (value: any): ClassificationKey | null => {
  const key = String(value || "").trim().toLowerCase();
  if (key === "conventional") return "conventional";
  if (key === "natural") return "natural";
  if (key === "organic") return "organic";
  if (key === "ipm-quality" || key === "ipm" || key === "ipm_quality" || key === "ipmquality") return "ipm-quality";
  if (key === "gi-tag" || key === "gi" || key === "gi_tag" || key === "gitag") return "gi-tag";
  return null;
};

export const resolveActiveClassificationTheme = (values: any[]): ClassificationTheme => {
  const keys = (Array.isArray(values) ? values : [values])
    .map(normalizeClassificationKey)
    .filter((v): v is ClassificationKey => Boolean(v));
  if (!keys.length) return THEME_MAP.conventional;
  return keys
    .map((key) => THEME_MAP[key])
    .sort((a, b) => b.priority - a.priority)[0];
};

export const getClassificationTheme = (value: any): ClassificationTheme => {
  const key = normalizeClassificationKey(value) || "conventional";
  return THEME_MAP[key];
};

export const getClassificationOptions = (): { key: ClassificationKey; label: string; icon: IconType }[] =>
  CLASSIFICATION_OPTIONS.map((item) => ({
    key: item.key,
    label: item.label,
    icon: THEME_MAP[item.key].icon,
  }));

export const getClassificationBadges = (product: any): { key: ClassificationKey; label: string }[] => {
  const badges: { key: ClassificationKey; label: string }[] = [];
  if (product?.isNatural) badges.push({ key: "natural", label: "Natural" });
  if (product?.isOrganic) badges.push({ key: "organic", label: "Organic" });
  if (product?.isIpmQuality) badges.push({ key: "ipm-quality", label: "IPM Quality" });
  if (product?.isGiTagged) badges.push({ key: "gi-tag", label: "GI Tag" });
  if (!badges.length) badges.push({ key: "conventional", label: "Conventional" });
  return badges;
};

export const classificationBadgeClass = (key: ClassificationKey): string => THEME_MAP[key].badgeClass;
export const classificationIcon = (key: ClassificationKey): IconType => THEME_MAP[key].icon;
