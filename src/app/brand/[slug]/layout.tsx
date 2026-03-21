import type { Metadata } from "next";
import { buildPublicWebApiUrl } from "@/utils/publicApi";
import { buildMetadata } from "@/utils/seo";

type BrandResponse = {
  data?: {
    data?: {
      name?: string;
      slug?: string;
      description?: string;
    };
  };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const requestUrl = buildPublicWebApiUrl(`/brand/details/${encodeURIComponent(slug)}`);

  try {
    const res = await fetch(requestUrl, { cache: "no-store" });
    if (!res.ok) {
      return {
        title: "Brand Not Found | OBAOL Supreme",
        robots: { index: false, follow: false },
      };
    }
    const body = (await res.json()) as BrandResponse;
    const company = body?.data?.data;
    const companyName = company?.name || "Brand";
    const descriptionBase =
      company?.description ||
      `${companyName} is listed on OBAOL Supreme with verified commodity execution support.`;
    const description = `${descriptionBase} Starting in India, OBAOL is expanding globally across key commodity corridors.`;

    return buildMetadata({
      title: `${companyName} | Brand on OBAOL Supreme`,
      description,
      keywords: [companyName, "brand profile", "commodity supplier"],
      path: `/brand/${slug}`,
    });
  } catch {
    return {
      title: "Brand Not Found | OBAOL Supreme",
      robots: { index: false, follow: false },
    };
  }
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
