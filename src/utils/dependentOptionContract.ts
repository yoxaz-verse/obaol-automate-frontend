export const extractDependentOptionRows = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  if (Array.isArray(raw?.data?.data?.data)) return raw.data.data.data;
  return [];
};

export const buildDependentOptionParams = (
  parentKey?: string,
  parentValue?: string | string[],
): Record<string, string | string[]> => ({
  limit: "2000",
  ...(parentKey && parentValue ? { [parentKey]: parentValue } : {}),
});
