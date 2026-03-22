"use client";

import { useMemo, useState } from "react";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";
import {
  EXPORT_RESOURCE_CATEGORIES,
  EXPORT_RESOURCES,
  type ExportResourceCategory,
} from "@/data/export-resources";

const ALL_CATEGORIES = "All";

export default function ExportResourcesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  const filteredResources = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    return EXPORT_RESOURCES.filter((resource) => {
      const categoryMatch = category === ALL_CATEGORIES || resource.category === category;
      if (!categoryMatch) return false;
      if (!searchLower) return true;
      return (
        resource.name.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.category.toLowerCase().includes(searchLower)
      );
    });
  }, [category, search]);

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-12 pt-28 md:pt-32">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Export Resource Center
          </h1>
          <p className="mt-2 text-sm md:text-base text-default-600">
            Verified official links for Indian exporters and agro trade operations.
          </p>
        </div>
        <div className="mb-8">
          <IndiaFirstNote />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-default-600">
              Search
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by website, category, or keyword"
              className="h-11 w-full rounded-xl border border-default-200 bg-content1 px-3 text-sm text-foreground outline-none focus:border-warning"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-default-600">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 w-full rounded-xl border border-default-200 bg-content1 px-3 text-sm text-foreground outline-none focus:border-warning"
            >
              <option value={ALL_CATEGORIES}>{ALL_CATEGORIES}</option>
              {EXPORT_RESOURCE_CATEGORIES.map((item: ExportResourceCategory) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="rounded-xl border border-default-200 bg-content1 px-4 py-8 text-center text-default-600">
            No resources found for the current search/filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <article
                key={resource.id}
                className="rounded-xl border border-default-200 bg-content1 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-foreground">{resource.name}</h2>
                  <span className="rounded-full border border-success-300 bg-success-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success-700 dark:bg-success-900/30 dark:text-success-300 dark:border-success-700">
                    Official
                  </span>
                </div>
                <p className="mb-3 text-sm text-default-600">{resource.description}</p>
                <div className="mb-3">
                  <span className="rounded-md bg-default-100 px-2 py-1 text-xs text-default-700 dark:bg-default-100/10 dark:text-default-300">
                    {resource.category}
                  </span>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-warning"
                >
                  Visit official website
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
