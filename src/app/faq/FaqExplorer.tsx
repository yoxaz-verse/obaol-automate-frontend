"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiArrowUpRight, FiSearch, FiX } from "react-icons/fi";
import { FAQ_CATEGORIES, FAQS, filterFaqs } from "./faqSchema";

export default function FaqExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const filteredFaqs = useMemo(() => filterFaqs(FAQS, query, category), [query, category]);
  const hasFilters = Boolean(query.trim()) || category !== "all";
  const resetFilters = () => { setQuery(""); setCategory("all"); };

  return (
    <div className="not-prose">
      <div className="sticky top-3 z-20 rounded-2xl border border-default-200 bg-background/95 p-4 shadow-sm backdrop-blur-md md:p-5">
        <label htmlFor="faq-search" className="sr-only">Search frequently asked questions</label>
        <div className="relative">
          <FiSearch aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-default-500" />
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search roles, verification, logistics, pricing, AI…"
            className="w-full rounded-xl border border-default-200 bg-content1 py-3 pl-11 pr-11 text-foreground outline-none transition placeholder:text-default-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear FAQ search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-default-500 transition hover:bg-content2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><FiX aria-hidden="true" /></button> : null}
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="FAQ categories">
          <CategoryButton active={category === "all"} onClick={() => setCategory("all")} label="All topics" count={FAQS.length} />
          {FAQ_CATEGORIES.map((item) => (
            <CategoryButton key={item.id} active={category === item.id} onClick={() => setCategory(item.id)} label={item.title} count={FAQS.filter((faq) => faq.category === item.id).length} />
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-default-500" aria-live="polite">
        <p>{filteredFaqs.length} {filteredFaqs.length === 1 ? "answer" : "answers"} found</p>
        {hasFilters ? <button type="button" onClick={resetFilters} className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Reset search and category</button> : null}
      </div>

      {filteredFaqs.length ? (
        <div className="mt-6 space-y-12">
          {FAQ_CATEGORIES.map((section) => {
            const items = filteredFaqs.filter((faq) => faq.category === section.id);
            if (!items.length) return null;
            return (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-44">
                <div className="mb-5 border-b border-default-200 pb-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 id={`${section.id}-heading`} className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{section.title}</h2>
                    <span className="text-sm text-default-500">{items.length} {items.length === 1 ? "answer" : "answers"}</span>
                  </div>
                  <p className="mt-2 max-w-3xl text-default-500">{section.description}</p>
                </div>
                <div className="space-y-3">
                  {items.map((faq) => (
                    <details key={faq.id} id={faq.id} className="group scroll-mt-44 rounded-xl border border-default-200 bg-content1 shadow-sm transition hover:border-primary/30 open:border-primary/30">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded-xl px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:px-6">
                        <span className="font-medium leading-snug text-foreground">{faq.question}</span>
                        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-content2 text-xl text-default-500 transition-transform group-open:rotate-45 group-open:text-primary">+</span>
                      </summary>
                      <div className="border-t border-default-100 px-5 py-5 text-default-600 md:px-6">
                        <p className="max-w-4xl leading-7">{faq.answer}</p>
                        {faq.relatedLink ? <Link href={faq.relatedLink.href} className="mt-4 inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{faq.relatedLink.label}<FiArrowUpRight aria-hidden="true" /></Link> : null}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-default-300 bg-content1 px-6 py-14 text-center">
          <h2 className="text-xl font-semibold text-foreground">No matching answers</h2>
          <p className="mt-2 text-default-500">Try a broader phrase or search across all topics.</p>
          <button type="button" onClick={resetFilters} className="mt-5 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Show all FAQs</button>
        </div>
      )}
    </div>
  );
}

function CategoryButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "border-primary bg-primary text-primary-foreground" : "border-default-200 bg-content1 text-default-600 hover:border-primary/50 hover:text-foreground"}`}>
      {label} <span className="ml-1 opacity-75">{count}</span>
    </button>
  );
}
