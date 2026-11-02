import SectionSkeleton from "@/components/ui/SectionSkeleton";

export default function DashboardRouteSkeleton({ label = "Loading workspace" }: { label?: string }) {
  return (
    <section className="min-h-[70vh] w-full py-4" role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="mb-6 h-24 animate-pulse rounded-3xl border border-default-200 bg-default-100 motion-reduce:animate-none" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-2xl bg-default-100 motion-reduce:animate-none" />
        <div className="h-28 animate-pulse rounded-2xl bg-default-100 motion-reduce:animate-none" />
        <div className="h-28 animate-pulse rounded-2xl bg-default-100 motion-reduce:animate-none" />
      </div>
      <SectionSkeleton rows={6} className="mt-6 rounded-3xl border border-default-200 p-5" />
    </section>
  );
}
