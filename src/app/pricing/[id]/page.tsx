import PublicRateList from "@/components/public/PublicRateList";

export default function PricingPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background py-8">
      <div className="w-[95%]">
        <PublicRateList
          displayOnly
          rate="displayedRate"
          variantRateMixed
          additionalParams={{
            associateCompanyName: params.id,
          }}
        />
      </div>
    </main>
  );
}
