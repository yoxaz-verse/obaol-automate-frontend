"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select, SelectItem, Tab, Tabs } from "@nextui-org/react";
import NewsMap from "@/components/news/NewsMap";
import { newsFeeds } from "@/data/newsFeeds";

type NewsItem = {
  title: string;
  link: string;
  summary: string;
  publishedAt: string | null;
  sourceName: string;
  continent: string;
  country: string;
};

type NewsPageContentProps = {
  variant?: "public" | "dashboard";
};

const CONTINENTS = ["Global", "Africa", "Asia", "Europe", "Americas", "Oceania"];

const getCountriesForContinent = (continent: string) => {
  const countries = new Set(
    newsFeeds
      .filter((feed) => continent === "Global" ? true : feed.continent === continent)
      .map((feed) => feed.country)
  );
  return Array.from(countries).sort();
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export default function NewsPageContent({ variant = "public" }: NewsPageContentProps) {
  const [continent, setContinent] = useState("Global");
  const [country, setCountry] = useState("");
  const [view, setView] = useState("map");
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const countries = useMemo(() => getCountriesForContinent(continent), [continent]);

  const fetchNews = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("continent", continent);
      if (country) params.set("country", country);
      params.set("limit", "200");
      params.set("translate", "1");
      params.set("lang", "en");
      const res = await fetch(`/api/news?${params.toString()}`);
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || "Failed to load news.");
      setItems(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load news.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [continent, country]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const needle = search.toLowerCase();
    return items.filter((item) =>
      [item.title, item.summary, item.sourceName].some((val) => String(val || "").toLowerCase().includes(needle))
    );
  }, [items, search]);

  const groupedByCountry = useMemo(() => {
    const map = new Map<string, NewsItem[]>();
    filtered.forEach((item) => {
      const key = item.country || "Global";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return map;
  }, [filtered]);

  const selectedCountryItems = selectedCountry ? groupedByCountry.get(selectedCountry) || [] : [];

  return (
    <section className="mx-2 md:mx-6 mb-6">
      <div className="rounded-xl border border-default-200/70 bg-content1/95 p-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Trade News</h1>
            <p className="text-sm text-default-500">Agro‑trade updates from curated RSS sources.</p>
          </div>
          <Button size="sm" onPress={fetchNews} isLoading={loading}>
            Refresh
          </Button>
        </div>

        {variant === "public" && (
          <div className="rounded-lg border border-default-200/70 bg-default-100/40 p-3 text-sm text-default-600">
            Track real‑time agro‑commodity signals by continent, country, and supply route.
            Use the map to explore region‑specific headlines and the list view for fast scanning.
          </div>
        )}

        <Tabs selectedKey={continent} onSelectionChange={(key) => {
          setContinent(String(key));
          setCountry("");
          setSelectedCountry("");
        }}>
          {CONTINENTS.map((c) => (
            <Tab key={c} title={c} />
          ))}
        </Tabs>

        <div className="flex flex-wrap gap-3 items-center">
          <Input
            className="max-w-sm"
            placeholder="Search headlines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            className="max-w-xs"
            selectedKeys={country ? [country] : []}
            onSelectionChange={(keys) => setCountry(String(Array.from(keys)[0] || ""))}
            placeholder="Filter by country"
          >
            {countries.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </Select>
          <Tabs selectedKey={view} onSelectionChange={(key) => setView(String(key))} size="sm">
            <Tab key="map" title="Map" />
            <Tab key="list" title="List" />
          </Tabs>
        </div>
      </div>

      {error ? (
        <div className="mt-4 text-danger">{error}</div>
      ) : null}

      {view === "list" ? (
        <div className="mt-4 rounded-xl border border-default-200/70 bg-content1/95 overflow-hidden">
          {loading && filtered.length === 0 ? (
            <div className="p-6 text-center text-default-500">
              <span className="inline-flex items-center gap-2">
                Fetching feeds
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-default-500 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-default-500 animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-default-500 animate-pulse [animation-delay:300ms]" />
                </span>
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-default-500">No news available for the selected filters.</div>
          ) : (
            <ul className="divide-y divide-default-200/60">
              {filtered.map((item) => (
                <li key={item.link} className="p-4">
                  <div className="text-xs text-default-500">{item.sourceName} • {item.country} • {formatDate(item.publishedAt)}</div>
                  <a className="text-base font-semibold text-primary-400 hover:underline" href={item.link} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                  <p className="text-sm text-default-400 mt-1">{item.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          {loading ? (
            <div className="h-[520px] rounded-xl border border-default-200/70 bg-content1/95 flex items-center justify-center">
              <div className="text-default-500 text-sm">
                <span className="inline-flex items-center gap-2">
                  Fetching feeds
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-default-500 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-default-500 animate-pulse [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-default-500 animate-pulse [animation-delay:300ms]" />
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <NewsMap
              items={filtered}
              onSelectCountry={(value) => setSelectedCountry(value)}
              loading={loading}
              loadedCount={filtered.length}
            />
          )}
          <div className="rounded-xl border border-default-200/70 bg-content1/95 p-4 h-[520px] overflow-auto">
            <div className="text-sm text-default-500 mb-2">Country details</div>
            {!selectedCountry ? (
              <div className="text-default-500">Click a country pin to view headlines.</div>
            ) : selectedCountryItems.length === 0 ? (
              <div className="text-default-500">No headlines found for {selectedCountry}.</div>
            ) : (
              <div>
                <div className="text-lg font-semibold mb-3">{selectedCountry}</div>
                <ul className="space-y-3">
                  {selectedCountryItems.map((item) => (
                    <li key={item.link}>
                      <div className="text-xs text-default-500">{item.sourceName} • {formatDate(item.publishedAt)}</div>
                      <a className="text-sm font-semibold text-primary-400 hover:underline" href={item.link} target="_blank" rel="noreferrer">
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
