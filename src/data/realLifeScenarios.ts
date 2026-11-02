import { buildPublicWebApiUrl } from "@/utils/publicApi";
import type { RealLifeScenario } from "@/types/realLifeScenario";

const readData = async (response: Response, context: string) => {
  if (!response.ok) {
    console.error(`[real-life-scenarios] ${context} failed with HTTP ${response.status} from ${response.url}`);
    return null;
  }
  const body = await response.json();
  return body?.data ?? null;
};

const reportFetchFailure = (context: string, error: unknown) => {
  console.error(`[real-life-scenarios] ${context} request failed`, error);
};

export async function getPublishedRoleScenarios(roleSlug: string): Promise<RealLifeScenario[]> {
  try {
    const response = await fetch(buildPublicWebApiUrl(`/real-life-scenarios/public?roleSlug=${encodeURIComponent(roleSlug)}`), { cache: "no-store" });
    const data = await readData(response, `published list for ${roleSlug}`);
    return Array.isArray(data) ? data : [];
  } catch (error) { reportFetchFailure(`published list for ${roleSlug}`, error); return []; }
}

export async function getPublishedScenario(roleSlug: string, slug: string): Promise<RealLifeScenario | null> {
  try {
    const response = await fetch(buildPublicWebApiUrl(`/real-life-scenarios/public/${encodeURIComponent(roleSlug)}/${encodeURIComponent(slug)}`), { cache: "no-store" });
    return await readData(response, `published detail for ${roleSlug}/${slug}`) as RealLifeScenario | null;
  } catch (error) { reportFetchFailure(`published detail for ${roleSlug}/${slug}`, error); return null; }
}

export async function getScenarioPreview(id: string, token: string): Promise<RealLifeScenario | null> {
  try {
    const response = await fetch(buildPublicWebApiUrl(`/real-life-scenarios/preview/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`), { cache: "no-store" });
    return await readData(response, `preview for ${id}`) as RealLifeScenario | null;
  } catch (error) { reportFetchFailure(`preview for ${id}`, error); return null; }
}

export async function getAllPublishedScenarios(): Promise<RealLifeScenario[]> {
  try {
    const response = await fetch(buildPublicWebApiUrl("/real-life-scenarios/public"), { cache: "no-store" });
    const data = await readData(response, "published sitemap list");
    return Array.isArray(data) ? data : [];
  } catch (error) { reportFetchFailure("published sitemap list", error); return []; }
}
