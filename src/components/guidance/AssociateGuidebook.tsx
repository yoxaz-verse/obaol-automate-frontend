"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LuArrowRight, LuBookOpen, LuCircleCheck, LuChevronDown, LuCircleAlert,
  LuExternalLink, LuListChecks, LuSearch, LuShieldCheck, LuSparkles, LuWrench,
} from "react-icons/lu";
import {
  AssociateGuideCategory,
  AssociateGuideProfile,
  AssociateGuideTopic,
  associateGuideCategories,
  getAssociateGuideTopics,
  searchAssociateGuideTopics,
} from "./associateGuideContent";

type Props = {
  profile: AssociateGuideProfile;
  registrationStatus?: string | null;
};

const profileLabels: Record<AssociateGuideProfile, string> = {
  buyer: "Buying associate",
  seller: "Selling associate",
  both: "Buying and selling associate",
  service: "Service provider associate",
  incomplete: "Associate setup guide",
};

const approvalLabels = {
  ANY: "Available at every account stage",
  ONBOARDING: "For onboarding accounts",
  PENDING: "Available while approval is pending",
  APPROVED: "Requires approved access",
};

const matchesApproval = (topic: AssociateGuideTopic, status?: string | null) => {
  if (topic.approval === "ANY") return true;
  const normalized = String(status || "APPROVED").toUpperCase().replace("PENDING_REVIEW", "PENDING");
  return normalized === topic.approval;
};

function TopicDetails({ topic, status, topics }: { topic: AssociateGuideTopic; status?: string | null; topics: AssociateGuideTopic[] }) {
  const accessible = matchesApproval(topic, status);
  const related = topic.related
    .map((id) => topics.find((candidate) => candidate.id === id))
    .filter(Boolean) as AssociateGuideTopic[];

  return (
    <div className="space-y-7 border-t border-divider px-5 pb-6 pt-6 md:px-7">
      {topic.screenshot && (
        <figure className="overflow-hidden rounded-2xl border border-divider bg-content2/50">
          <Image
            src={topic.screenshot.src}
            alt={topic.screenshot.alt}
            width={1440}
            height={900}
            className="h-auto w-full"
            sizes="(max-width: 1024px) 100vw, 760px"
          />
          <figcaption className="px-4 py-3 text-xs leading-5 text-default-500">{topic.screenshot.caption}</figcaption>
        </figure>
      )}

      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold"><LuShieldCheck className="text-obaol-500" /> Before you begin</h4>
        <ul className="grid gap-2 text-sm text-default-600">
          {topic.prerequisites.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">•</span><span>{item}</span></li>)}
        </ul>
      </section>

      <section>
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold"><LuListChecks className="text-obaol-500" /> Step by step</h4>
        <ol className="space-y-4">
          {topic.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-6 text-default-700">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-obaol-500 text-xs font-black text-black">{index + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold"><LuCircleCheck className="text-success-500" /> Expected result</h4>
        <p className="text-sm leading-6 text-default-600">{topic.outcome}</p>
      </section>

      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold"><LuWrench className="text-warning-500" /> If something goes wrong</h4>
        <ul className="space-y-2 text-sm leading-6 text-default-600">
          {topic.troubleshooting.map((item) => <li key={item} className="flex gap-2"><LuCircleAlert className="mt-1 shrink-0 text-warning-500" size={15} /><span>{item}</span></li>)}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-divider pt-5">
        {topic.route && (accessible ? (
          <Link href={topic.route} className="inline-flex items-center gap-2 rounded-xl bg-obaol-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-obaol-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500">
            Open {topic.pageName || "page"} <LuExternalLink size={15} />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-xl border border-warning-400/40 bg-warning-50 px-4 py-2.5 text-sm font-semibold text-warning-700 dark:bg-warning-500/10 dark:text-warning-300">
            <LuShieldCheck /> {approvalLabels[topic.approval]}
          </span>
        ))}
        {related.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-divider px-3 py-2 text-xs font-semibold text-default-600 hover:border-obaol-500 hover:text-obaol-600">
            {item.title} <LuArrowRight size={13} />
          </a>
        ))}
      </div>
    </div>
  );
}

export default function AssociateGuidebook({ profile, registrationStatus }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AssociateGuideCategory | "all">("all");
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set());
  const allTopics = useMemo(() => getAssociateGuideTopics(profile), [profile]);
  const filteredTopics = useMemo(() => {
    const searched = searchAssociateGuideTopics(allTopics, query);
    return category === "all" ? searched : searched.filter((topic) => topic.category === category);
  }, [allTopics, category, query]);

  useEffect(() => {
    const openFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      const id = window.location.hash.slice(1) || params.get("topic") || "";
      if (!id || !allTopics.some((topic) => topic.id === id)) return;
      setOpenTopics((current) => new Set(current).add(id));
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    };
    openFromLocation();
    window.addEventListener("hashchange", openFromLocation);
    return () => window.removeEventListener("hashchange", openFromLocation);
  }, [allTopics]);

  const toggleTopic = (id: string) => {
    setOpenTopics((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    if (window.location.hash !== `#${id}`) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
  };

  const jumpToCategory = (next: AssociateGuideCategory | "all") => {
    setCategory(next);
    setQuery("");
    document.getElementById("guide-topics")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-[2rem] border border-divider bg-content1 p-6 shadow-sm md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-obaol-500/10 px-3 py-1.5 text-xs font-bold text-obaol-600 dark:text-obaol-400">
                <LuBookOpen /> Associate Guidebook
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">Learn the platform by completing real tasks</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-default-600 md:text-base">
                Follow an end-to-end journey or look up a page when you need help. Instructions are matched to your company capabilities and current access.
              </p>
            </div>
            <div className="rounded-2xl border border-obaol-500/20 bg-obaol-500/5 p-4 lg:max-w-xs">
              <p className="flex items-center gap-2 text-sm font-bold"><LuSparkles className="text-obaol-500" /> {profileLabels[profile]}</p>
              <p className="mt-1 text-xs leading-5 text-default-500">
                {profile === "incomplete" ? "Complete your company capabilities to unlock a more relevant guide." : "Shared topics and the workflows relevant to your capabilities are shown."}
              </p>
            </div>
          </div>

          <div className="mt-8 relative">
            <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-default-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tasks, pages, buttons, or problems"
              aria-label="Search the Associate Guidebook"
              className="h-13 w-full rounded-2xl border border-divider bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-obaol-500 focus:ring-2 focus:ring-obaol-500/20"
            />
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px,minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-8 lg:self-start" aria-label="Guidebook table of contents">
            <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
              <button onClick={() => jumpToCategory("all")} aria-pressed={category === "all"} className={`min-w-max rounded-xl px-4 py-3 text-left text-sm font-bold transition ${category === "all" ? "bg-obaol-500 text-black" : "border border-divider bg-content1 hover:border-obaol-500"}`}>All topics</button>
              {associateGuideCategories.map((item) => (
                <button key={item.id} onClick={() => jumpToCategory(item.id)} aria-pressed={category === item.id} className={`min-w-max rounded-xl px-4 py-3 text-left transition ${category === item.id ? "bg-obaol-500 text-black" : "border border-divider bg-content1 hover:border-obaol-500"}`}>
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span className={`mt-1 hidden text-xs leading-5 lg:block ${category === item.id ? "text-black/70" : "text-default-500"}`}>{item.description}</span>
                </button>
              ))}
            </nav>
            <Link href="/dashboard/customer-support" className="mt-4 hidden items-center justify-between rounded-xl border border-divider bg-content1 px-4 py-3 text-sm font-semibold hover:border-obaol-500 lg:flex">
              Still need help? <LuArrowRight />
            </Link>
          </aside>

          <section id="guide-topics" aria-live="polite">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold">{filteredTopics.length} {filteredTopics.length === 1 ? "topic" : "topics"}</p>
              {(query || category !== "all") && <button onClick={() => { setQuery(""); setCategory("all"); }} className="text-xs font-bold text-obaol-600 hover:underline">Clear filters</button>}
            </div>

            {filteredTopics.length ? (
              <div className="space-y-4">
                {filteredTopics.map((topic) => {
                  const isOpen = openTopics.has(topic.id);
                  return (
                    <article id={topic.id} key={topic.id} className="scroll-mt-8 overflow-hidden rounded-2xl border border-divider bg-content1 shadow-sm">
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        aria-expanded={isOpen}
                        aria-controls={`${topic.id}-content`}
                        className="flex w-full items-start justify-between gap-5 p-5 text-left outline-none hover:bg-content2/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-obaol-500 md:p-7"
                      >
                        <span>
                          <span className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-obaol-600 dark:text-obaol-400">
                            {associateGuideCategories.find((item) => item.id === topic.category)?.label}
                            <span aria-hidden="true">•</span>
                            {approvalLabels[topic.approval]}
                          </span>
                          <span className="block text-lg font-black md:text-xl">{topic.title}</span>
                          <span className="mt-2 block text-sm leading-6 text-default-600">{topic.summary}</span>
                        </span>
                        <LuChevronDown className={`mt-1 shrink-0 transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                      </button>
                      {isOpen && <div id={`${topic.id}-content`}><TopicDetails topic={topic} status={registrationStatus} topics={allTopics} /></div>}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-divider bg-content1 p-8 text-center">
                <LuSearch className="mx-auto text-default-400" size={28} />
                <h2 className="mt-3 text-lg font-bold">No guide topics match that search</h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-default-500">Try a page name such as Orders, a task such as publish a listing, or browse one of the guide sections.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {associateGuideCategories.map((item) => <button key={item.id} onClick={() => jumpToCategory(item.id)} className="rounded-xl border border-divider px-3 py-2 text-sm font-semibold hover:border-obaol-500">{item.label}</button>)}
                  <Link href="/dashboard/customer-support" className="rounded-xl bg-obaol-500 px-3 py-2 text-sm font-bold text-black">Contact support</Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
