import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CTASection from "@/components/home/ctasection";
import Footer from "@/components/home/footer";
import { buildPublicWebApiUrl } from "@/utils/publicApi";

const BASE_URL = "https://obaol.com";

type ProductDetails = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  subCategory?: {
    _id?: string;
    name?: string;
    category?: { name?: string } | null;
  } | null;
  state?: Array<{ _id?: string; name?: string }>;
};

type ApiResponse = {
  success?: boolean;
  data?: ProductDetails | null;
};

async function getProductDetails(slug: string): Promise<ProductDetails | null> {
  const res = await fetch(buildPublicWebApiUrl(`/products/slug/${encodeURIComponent(slug)}`), {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const body = (await res.json()) as ApiResponse;
  return body?.data || null;
}

async function getRelatedProducts(subCategoryId?: string, currentSlug?: string) {
  if (!subCategoryId) return [];
  const res = await fetch(
    buildPublicWebApiUrl(`/products?subCategory=${encodeURIComponent(subCategoryId)}&limit=6`),
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const body = await res.json();
  const rows = Array.isArray(body?.data?.data) ? body.data.data : Array.isArray(body?.data) ? body.data : [];
  return rows.filter((row: any) => String(row?.slug || "") !== String(currentSlug || "")).slice(0, 4);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetails(slug);
  if (!product) {
    return {
      title: "Product Not Found | OBAOL Supreme",
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.name} | OBAOL Product`;
  const description =
    product.description?.slice(0, 155) ||
    `Explore ${product.name} on OBAOL with verified commodity context and execution support details.`;
  const canonical = `${BASE_URL}/product/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      images: [{ url: "/logo.png", width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductDetails(slug);
  if (!product) notFound();

  const states = Array.isArray(product.state)
    ? product.state.map((s) => String(s?.name || "").trim()).filter(Boolean)
    : [];
  const related = await getRelatedProducts(product.subCategory?._id, product.slug);
  const canonical = `${BASE_URL}/product/${product.slug}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} listed on OBAOL.`,
    category: product.subCategory?.category?.name || product.subCategory?.name || "Commodity",
    url: canonical,
    areaServed: states.length ? states.map((stateName) => ({ "@type": "AdministrativeArea", name: stateName })) : undefined,
    brand: {
      "@type": "Organization",
      name: "OBAOL Supreme",
    },
  };

  return (
    <main className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <section className="mx-auto w-[95%] max-w-6xl py-12">
        <p className="text-xs uppercase tracking-[0.18em] text-default-500">
          {product.subCategory?.category?.name || "Commodity"} / {product.subCategory?.name || "General"}
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">{product.name}</h1>
        <p className="mt-5 max-w-3xl text-default-600 leading-relaxed">
          {product.description || "No detailed description is available for this product yet."}
        </p>
      </section>

      <section className="mx-auto w-[95%] max-w-6xl pb-12">
        <div className="rounded-2xl border border-default-200 bg-content1 p-6">
          <h2 className="text-xl font-bold">Available Regions</h2>
          {states.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {states.map((stateName) => (
                <span
                  key={stateName}
                  className="rounded-full border border-default-300 px-3 py-1 text-xs font-semibold text-default-700"
                >
                  {stateName}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-default-500">
              Region-specific availability details are not published yet.
            </p>
          )}
        </div>
      </section>

      {related.length ? (
        <section className="mx-auto w-[95%] max-w-6xl pb-12">
          <h2 className="text-2xl font-bold">Related Products</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.map((item: any) => (
              <Link
                key={String(item._id)}
                href={item.slug ? `/product/${item.slug}` : "/product"}
                className="rounded-xl border border-default-200 bg-content1 p-4 hover:border-warning-500/50 transition-colors"
              >
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-default-500 line-clamp-2">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <CTASection />
      <Footer />
    </main>
  );
}
