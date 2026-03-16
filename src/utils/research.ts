export interface CommodityFacts {
    extract: string;
    title: string;
    thumbnail?: string;
    sourceUrl: string;
}

/**
 * Fetches interesting facts and summary for a commodity using the Wikipedia API.
 * Uses the REST API for easier consumption.
 */
export async function fetchCommodityFacts(query: string): Promise<CommodityFacts | null> {
    if (!query) return null;

    try {
        // Wikipedia search for the most relevant page
        const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const res = await fetch(searchUrl, {
            next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (!res.ok) {
            // Try with a fallback if the first one fails (e.g. adding "commodity")
            if (!query.toLowerCase().includes("commodity")) {
                return fetchCommodityFacts(`${query} commodity`);
            }
            return null;
        }

        const data = await res.json();

        return {
            extract: data.extract,
            title: data.title,
            thumbnail: data.thumbnail?.source,
            sourceUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        };
    } catch (error) {
        console.error(`[Research] Error fetching facts for ${query}:`, error);
        return null;
    }
}

/**
 * Heuristic to extract "Key Producing Regions" or specific facts from text if possible.
 */
export function getInterestingSnippets(extract: string): string[] {
    if (!extract) return [];

    // Simple sentence splitting
    const sentences = extract.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 20);

    // Return a few interesting ones
    return sentences.slice(1, 4); // Usually first is intro, next few are descriptive
}
