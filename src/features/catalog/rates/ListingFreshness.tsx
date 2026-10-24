import { formatLastLiveAge } from "@/utils/lastLiveAge";

export const formatLastLiveDate = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  if (sameDay(date, today)) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-obaol-500 shadow-[0_0_12px_rgba(207,152,60,0.8)]" />
        <span className="text-[10px] font-black uppercase italic tracking-[0.1em] text-obaol-500">Today</span>
      </div>
    );
  }
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const LastLiveAgeBadge = ({ value }: { value: unknown }) => {
  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) return null;
  const label = formatLastLiveAge(value);
  if (!label) return null;
  return (
    <span
      aria-label={`Last live ${label}`}
      className="inline-flex w-fit items-center rounded-full border border-amber-200/70 bg-amber-50/80 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
    >
      Last live {label}
    </span>
  );
};
