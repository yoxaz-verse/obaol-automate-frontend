import BrandedLoader from "@/components/ui/BrandedLoader";

export default function DashboardLoading() {
    return (
        <div className="w-full h-full min-h-[70vh] flex flex-col items-center justify-center animate-pulse">
            <BrandedLoader message="Loading..." variant="default" className="bg-transparent border-none shadow-none" />
        </div>
    );
}
