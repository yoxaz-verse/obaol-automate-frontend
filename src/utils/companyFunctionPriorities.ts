export const reconcileCompanyFunctionPriorities = (
  selectedIds: string[],
  currentPriorities: string[],
  limit = 3
) => {
  const selected = Array.from(new Set(selectedIds.map(String).filter(Boolean)));
  const retained = Array.from(new Set(currentPriorities.map(String).filter((id) => selected.includes(id))));
  const candidates = selected.filter((id) => !retained.includes(id));
  return [...retained, ...candidates].slice(0, Math.min(limit, selected.length));
};
