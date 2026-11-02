import { buildPublicWebApiUrl } from "@/utils/publicApi";
import type { RealLifeScenario } from "@/types/realLifeScenario";

const readData = async (response: Response) => {
  if (!response.ok) return null;
  const body = await response.json();
  return body?.data ?? null;
};

export async function getPublishedRoleScenarios(roleSlug: string): Promise<RealLifeScenario[]> {
  try {
    const response = await fetch(buildPublicWebApiUrl(`/real-life-scenarios/public?roleSlug=${encodeURIComponent(roleSlug)}`), { cache: "no-store" });
    const data = await readData(response);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function getPublishedScenario(roleSlug: string, slug: string): Promise<RealLifeScenario | null> {
  try {
    const response = await fetch(buildPublicWebApiUrl(`/real-life-scenarios/public/${encodeURIComponent(roleSlug)}/${encodeURIComponent(slug)}`), { cache: "no-store" });
    return await readData(response) as RealLifeScenario | null;
  } catch { return null; }
}

export async function getScenarioPreview(id: string, token: string): Promise<RealLifeScenario | null> {
  try {
    const response = await fetch(buildPublicWebApiUrl(`/real-life-scenarios/preview/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`), { cache: "no-store" });
    return await readData(response) as RealLifeScenario | null;
  } catch { return null; }
}

export async function getAllPublishedScenarios(): Promise<RealLifeScenario[]> {
  try {
    const response = await fetch(buildPublicWebApiUrl("/real-life-scenarios/public"), { cache: "no-store" });
    const data = await readData(response);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
