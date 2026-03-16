export interface SeoTags {
    title: string;
    description: string;
    keywords?: string[];
    canonical?: string;
    ogType?: "website" | "article" | "product";
    ogImage?: string;
    geo?: {
        region?: string; // e.g. "IN-MH"
        placename?: string; // e.g. "Mumbai"
        position?: string; // e.g. "19.0760;72.8777"
    };
}

export function generateMetadataTags(tags: SeoTags) {
    const baseMetadata: any = {
        title: tags.title,
        description: tags.description,
        keywords: tags.keywords,
        alternates: {
            canonical: tags.canonical,
        },
        openGraph: {
            title: tags.title,
            description: tags.description,
            url: tags.canonical,
            type: tags.ogType || "website",
            images: [
                {
                    url: tags.ogImage || "/logo.png",
                    width: 1200,
                    height: 630,
                    alt: tags.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: tags.title,
            description: tags.description,
            images: [tags.ogImage || "/logo.png"],
        },
    };

    // Geo tags are usually added as other meta tags in Next.js metadata
    if (tags.geo) {
        baseMetadata.other = {
            ...baseMetadata.other,
            "geo.region": tags.geo.region,
            "geo.placename": tags.geo.placename,
            "geo.position": tags.geo.position,
            ICBM: tags.geo.position,
        };
    }

    return baseMetadata;
}
