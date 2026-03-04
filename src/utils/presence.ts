const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export const isOnline = (lastSeenAt?: string | Date | null, windowMs = ONLINE_WINDOW_MS): boolean => {
  if (!lastSeenAt) return false;
  const ts = new Date(lastSeenAt).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= windowMs;
};

export const formatLastSeen = (lastSeenAt?: string | Date | null): string => {
  if (!lastSeenAt) return "Never";
  const date = new Date(lastSeenAt);
  if (Number.isNaN(date.getTime())) return "Never";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

  return date.toLocaleString();
};

export const getPresenceStatus = (lastSeenAt?: string | Date | null): "ONLINE" | "OFFLINE" =>
  isOnline(lastSeenAt) ? "ONLINE" : "OFFLINE";

