export const formatLastLiveAge = (
  value: string | number | Date | null | undefined,
  now = new Date(),
): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || Number.isNaN(now.getTime())) return "";

  const dateDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAgo = Math.max(0, Math.floor((today - dateDay) / 86_400_000));

  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo} days ago`;
};
