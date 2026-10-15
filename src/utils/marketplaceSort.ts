export const resolveMarketplaceSort = (isLive: unknown) =>
  isLive === false || String(isLive).toLowerCase() === "false"
    ? "lastLiveDate:desc"
    : "lastLiveDate:asc";
