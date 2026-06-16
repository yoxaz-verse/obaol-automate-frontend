import Title from "@/components/titles";
import PublicRateList from "@/components/public/PublicRateList";

const toDisplayTitle = (value: string) =>
  decodeURIComponent(value || "")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function ObaolProductPage({
  params,
}: {
  params: { product: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background py-8">
      <div className="w-[95%]">
        <div className="mb-6">
          <Title title={toDisplayTitle(params.product)} />
        </div>
        <PublicRateList
          displayOnly
          rate="displayedRate"
          variantRateMixed
          additionalParams={{
            product: params.product,
          }}
        />
      </div>
    </main>
  );
}
