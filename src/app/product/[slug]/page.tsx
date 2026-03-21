import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CTASection from "@/components/home/ctasection";
import Footer from "@/components/home/footer";
import { buildPublicWebApiUrl } from "@/utils/publicApi";
import { fetchCommodityFacts } from "@/utils/research";
import ProductFacts from "@/components/product/ProductFacts";
import ProductNews from "@/components/product/ProductNews";
import { Spacer, Chip, Divider, Card, Image } from "@nextui-org/react";
import { buildMetadata } from "@/utils/seo";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";

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

type ProductSummary = {
  productId?: string;
  productName?: string;
  supplyLineCount?: number;
};

async function getProductDetails(slug: string): Promise<ProductDetails | null> {
  const nextPort = process.env.PORT || 3000;
  const origin = process.env.NEXTAUTH_URL || `http://localhost:${nextPort}`;
  const requestUrl = `${origin}/api/products?slug=${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(requestUrl, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const body = (await res.json()) as ApiResponse;
    return body?.data || null;
  } catch (error) {
    console.error(`[ProductDetail] Error fetching product details:`, error);
    return null;
  }
}

async function getProductSummary(slug: string): Promise<ProductSummary | null> {
  const nextPort = process.env.PORT || 3000;
  const origin = process.env.NEXTAUTH_URL || `http://localhost:${nextPort}`;
  const requestUrl = `${origin}/api/products?slug=${encodeURIComponent(slug)}&summary=1`;

  try {
    const res = await fetch(requestUrl, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data || null;
  } catch (error) {
    console.error(`[ProductDetail] Error fetching product summary:`, error);
    return null;
  }
}

async function getRelatedProducts(subCategoryId?: string, currentSlug?: string) {
  if (!subCategoryId) return [];
  const nextPort = process.env.PORT || 3000;
  const origin = process.env.NEXTAUTH_URL || `http://localhost:${nextPort}`;
  const requestUrl = `${origin}/api/products?subCategory=${encodeURIComponent(subCategoryId)}&limit=6`;

  try {
    const res = await fetch(requestUrl, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body = await res.json();
    const rows = Array.isArray(body?.data?.data) ? body.data.data : Array.isArray(body?.data) ? body.data : [];
    return rows.filter((row: any) => String(row?.slug || "") !== String(currentSlug || "")).slice(0, 4);
  } catch (error) {
    console.error(`[ProductDetail] Error fetching related products:`, error);
    return [];
  }
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

  const title = `${product.name} | Verified Commodity - OBAOL Supreme`;
  const description =
    product.description?.slice(0, 155) ||
    `Starting in India, explore ${product.name} on OBAOL with verified commodity context and execution support. We are expanding globally across key corridors.`;
  const canonical = `${BASE_URL}/product/${product.slug}`;

  return buildMetadata({
    title,
    description,
    keywords: [
      product.name,
      "commodity trading",
      product.subCategory?.name || "",
      "b2b trade",
      "agro commodities",
      "export import",
      "sourcing",
    ],
    path: `/product/${product.slug}`,
    type: "article",
  }) as Metadata;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductDetails(slug);
  if (!product) notFound();
  const summary = await getProductSummary(slug);
  const supplyLineCount = Number(summary?.supplyLineCount || 0);

  // Fetch research-based facts
  const facts = await fetchCommodityFacts(product.name);

  const states = Array.isArray(product.state)
    ? product.state.map((s) => String(s?.name || "").trim()).filter(Boolean)
    : [];
  const related = await getRelatedProducts(product.subCategory?._id, product.slug);
  const canonical = `${BASE_URL}/product/${product.slug}`;
  const productImage = (product as any)?.imageUrl || (product as any)?.image || (product as any)?.thumbnail || "";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} listed on OBAOL.`,
    category: product.subCategory?.category?.name || product.subCategory?.name || "Commodity",
    url: canonical,
    areaServed: states.length
      ? states.map((stateName) => ({ "@type": "AdministrativeArea", name: stateName }))
      : [
          { "@type": "Country", name: "India" },
          { "@type": "Country", name: "United Arab Emirates" },
          { "@type": "Country", name: "Saudi Arabia" },
          { "@type": "Place", name: "European Union" },
          { "@type": "Country", name: "United States" },
        ],
    brand: {
      "@type": "Organization",
      name: "OBAOL Supreme",
    },
    material: product.name,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Supply lines",
        value: supplyLineCount,
      },
    ],
    isRelatedTo: related.map(r => ({ "@type": "Product", name: r.name, url: `${BASE_URL}/product/${r.slug}` }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Products", item: `${BASE_URL}/product` },
      { "@type": "ListItem", position: 3, name: product.name, item: canonical },
    ],
  };

  return (
    <main className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-12 border-b border-default-100 bg-gradient-to-b from-content2/50 to-background">
        <div className="mx-auto w-[95%] max-w-6xl">
          <div className="space-y-4">
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-default-400">
              <Link href="/" className="hover:text-warning-500 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/product" className="hover:text-warning-500 transition-colors">Products</Link>
            </nav>

            <p className="text-xs font-bold uppercase tracking-widest text-warning-600">
              {product.subCategory?.category?.name || "Commodity"} / {product.subCategory?.name || "General"}
            </p>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground -ml-1">
              {product.name}
            </h1>

            <p className="mt-6 max-w-3xl text-lg md:text-xl text-default-600 leading-relaxed font-medium">
              {product.description || `High-quality ${product.name} trade facilitation with verified supply chains and execution support.`}
            </p>

            <div className="mt-6 rounded-2xl border border-default-200 bg-content1/60 px-4 py-3 md:px-5 md:py-4">
              <p className="text-sm md:text-base font-semibold text-foreground">
                OBAOL tracks {supplyLineCount.toLocaleString()} supply lines for {product.name}.
              </p>
              <p className="text-xs md:text-sm text-default-500 mt-1">
                These supply lines represent verified market presence and execution readiness across the OBAOL network.
              </p>
            </div>
            <div className="mt-4">
              <IndiaFirstNote />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="mx-auto w-[95%] max-w-6xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
          {/* Left Column: Research & News */}
          <div className="space-y-12">
            {facts && (
              <section>
                <ProductFacts facts={facts} productionRegions={states} />
              </section>
            )}

            <section>
              <ProductNews query={product.name} />
            </section>
          </div>

          {/* Right Column: Execution & Regions */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-default-200 bg-content1/50 p-6 shadow-sm">
              <div className="aspect-square rounded-2xl overflow-hidden bg-default-100 border border-default-200">
                {productImage ? (
                  <Image
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-default-400 text-sm font-semibold">
                    No image available
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-default-200 bg-content1/50 p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-warning-500 rounded-full" />
                  Available Regions
                </h2>
                <p className="mt-2 text-sm text-default-500 leading-relaxed">
                  Registered sourcing centers and established trade routes for {product.name}.
                </p>
              </div>

              {states.length ? (
                <div className="flex flex-wrap gap-2">
                  {states.map((stateName) => (
                    <Chip
                      key={stateName}
                      variant="flat"
                      className="bg-default-100/50 border border-default-200 text-default-700 font-bold text-xs px-3"
                    >
                      {stateName}
                    </Chip>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-default-100/30 p-6 text-center border-2 border-dashed border-default-200">
                  <p className="text-sm font-bold text-default-400">
                    Sourcing centers are being verified
                  </p>
                  <p className="text-[10px] text-default-400 mt-1 uppercase tracking-widest">Update pending</p>
                </div>
              )}

              <Divider className="opacity-50" />

              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-default-400">Execution Support</h3>
                <ul className="grid gap-3">
                  {["Verified Suppliers", "Quality Inspection", "Logistics Control", "Trade Settlement"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-default-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="bg-content2/20 border-y border-default-100 mb-12">
          <div className="mx-auto w-[95%] max-w-6xl py-12 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Expand Your Sourcing</h2>
              <p className="text-default-500 font-medium tracking-tight">Explore related commodities and trade opportunities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item: any) => (
                <Link
                  key={String(item._id)}
                  href={item.slug ? `/product/${item.slug}` : "/product"}
                  className="group rounded-3xl border border-default-200 bg-content1 p-6 hover:border-warning-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-warning-600 mb-2 truncate">
                    {item.subCategory?.name || "Commodity"}
                  </p>
                  <h3 className="text-lg font-black text-foreground group-hover:text-warning-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-3 text-xs text-default-500 line-clamp-2 leading-relaxed font-medium">
                    {item.description || `Facilitating verified ${item.name} trade and procurement.`}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />
      <Footer />
    </main>
  );
}
