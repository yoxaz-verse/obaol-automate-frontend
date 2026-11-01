import SectionSkeleton from "@/components/ui/SectionSkeleton";

export default function DashboardLoading() {
    return (
        <div className="w-full min-h-[70vh] py-4" role="status" aria-label="Loading page">
            <div className="mb-6 h-24 animate-pulse rounded-3xl bg-default-100" />
            <SectionSkeleton rows={6} className="rounded-3xl border border-default-200 p-5" />
        </div>
    );
}
