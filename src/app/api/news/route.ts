import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { newsFeeds } from "@/data/newsFeeds";

type CacheEntry = {
  createdAt: number;
  items: any[];
};

const cache = new Map<string, CacheEntry>();
const translateCache = new Map<string, string>();
const TTL_MS = 15 * 60 * 1000;
const parser = new Parser();

const withTimeout = async (url: string, timeoutMs: number) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
        "Accept-Language": "en-US,en;q=0.9",
      }
    });
    if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
    const text = await res.text();
    return text;
  } finally {
    clearTimeout(id);
  }
};

const normalizeItem = (item: any, feedMeta: any) => {
  const publishedAt = item.isoDate || item.pubDate || item.published || null;
  return {
    title: item.title || "",
    link: item.link || "",
    summary: item.contentSnippet || item.content || item.summary || "",
    publishedAt,
    sourceName: feedMeta.sourceName,
    continent: feedMeta.continent,
    country: feedMeta.country,
  };
};

const hasNonAscii = (value: string) => /[^\x00-\x7F]/.test(value);

const translateText = async (text: string, targetLang: string) => {
  const trimmed = text.trim();
  if (!trimmed) return text;
  const cacheKey = `${targetLang}::${trimmed}`;
  const cached = translateCache.get(cacheKey);
  if (cached) return cached;
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" +
    encodeURIComponent(targetLang) +
    "&dt=t&q=" +
    encodeURIComponent(trimmed);
  const res = await fetch(url);
  if (!res.ok) return text;
  const data = await res.json();
  const translated = Array.isArray(data)
    ? data[0]?.map((chunk: any) => chunk[0]).join("") || text
    : text;
  translateCache.set(cacheKey, translated);
  return translated;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const continent = searchParams.get("continent") || "Global";
  const country = searchParams.get("country") || "";
  const search = searchParams.get("search") || "";
  const limit = Math.min(Number(searchParams.get("limit") || 100), 200);
  const translate = searchParams.get("translate") !== "0";
  const targetLang = searchParams.get("lang") || "en";

  const cacheKey = `${continent}::${country || "ALL"}::${search || "NONE"}::${limit}::${translate ? targetLang : "raw"}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < TTL_MS) {
    return NextResponse.json({ success: true, data: cached.items });
  }

  const feeds = newsFeeds.filter((feed) => {
    const matchContinent = continent === "Global" ? true : feed.continent === continent;
    const matchCountry = country ? feed.country === country : true;
    return matchContinent && matchCountry;
  });

  const feedResults = await Promise.all(
    feeds.map(async (feed) => {
      try {
        // Increase timeout to 12s for global resilience
        const xml = await withTimeout(feed.rssUrl, 12000);
        const parsed = await parser.parseString(xml);
        const feedLang = String((parsed as any)?.language || "").toLowerCase();
        let items = (parsed.items || [])
          .map((item) => normalizeItem(item, feed))
          .filter((item) => item.title && item.link);

        // Search filtering logic
        if (search.trim()) {
          const needle = search.toLowerCase();
          items = items.filter(item =>
            [item.title, item.summary].some(text => String(text || "").toLowerCase().includes(needle))
          );
        }

        if (translate && items.length > 0) {
          const shouldTranslateFeed = feedLang && !feedLang.startsWith("en");
          items = await Promise.all(
            items.map(async (item) => {
              const needsTranslate =
                shouldTranslateFeed ||
                hasNonAscii(item.title) ||
                hasNonAscii(item.summary || "");
              if (!needsTranslate) return item;
              const translatedTitle = await translateText(item.title, targetLang);
              const translatedSummary = item.summary
                ? await translateText(item.summary, targetLang)
                : item.summary;
              return { ...item, title: translatedTitle, summary: translatedSummary };
            })
          );
        }
        return items;
      } catch (err) {
        console.error(`[NewsAPI] Error fetching feed ${feed.id}:`, err);
        return [];
      }
    })
  );

  const flat = feedResults.flat();
  const sorted = flat.sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });

  const result = sorted.slice(0, limit);
  cache.set(cacheKey, { createdAt: Date.now(), items: result });

  return NextResponse.json({ success: true, data: result });
}

