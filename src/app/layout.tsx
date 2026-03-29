import "../styles/global.css";
import type { Metadata } from "next";
import { Providers } from "./provider";
import { IBM_Plex_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";
import TranslationEngine from "@/components/dashboard/TranslationEngine";
import TopLoader from "@/components/ui/TopLoader";
import SoundInitializer from "@/components/ui/SoundInitializer";
import { BASE_URL, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, GEO_KEYWORDS, PRIMARY_MARKET, SITE_NAME } from "@/utils/seo";
import AnalyticsTracker from "@/components/ui/AnalyticsTracker";
import { Suspense } from "react";

// If loading a variable font, you don't need to specify the font weight
const font = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const devanagariFont = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  variable: "--font-devanagari",
  display: "swap",
});
// app/layout.tsx


// import { Source_Serif_4, IBM_Plex_Sans } from "next/font/google";

// const headingFont = Source_Serif_4({
//   subsets: ["latin"],
//   weight: ["600"],
//   variable: "--font-heading",
//   display: "swap",
// });

// const bodyFont = IBM_Plex_Sans({
//   subsets: ["latin"],
//   weight: ["400", "500"],
//   variable: "--font-body",
//   display: "swap",
// });


export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "OBAOL Supreme — Commodity Trade Execution System",
    template: `%s | ${SITE_NAME}`,
  },

  description: DEFAULT_DESCRIPTION,

  keywords: [...DEFAULT_KEYWORDS, ...GEO_KEYWORDS],

  authors: [{ name: "OBAOL" }],
  creator: "OBAOL",
  publisher: "OBAOL",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "OBAOL",
    title: "OBAOL Supreme — Where Commodity Trades Get Executed",
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "OBAOL Commodity Trade Execution System",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "OBAOL — Commodity Trade Execution System",
    description: DEFAULT_DESCRIPTION,
    images: ["/logo.png"],
  },

  category: "Business",
  icons: {
    icon: [
      { url: "/logo.png", href: "/logo.png", type: "image/png" }
    ],
    apple: [
      { url: "/logo.png", href: "/logo.png", type: "image/png" }
    ]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

const GTM_ID = "G-F4YK8H3Q4L";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${font.variable} ${devanagariFont.variable} text-foreground`}
    >

      <head>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <style dangerouslySetInnerHTML={{
          __html: `
          /* Aggressive Google Translate UI Hiding */
          .goog-te-banner-frame,
          .goog-te-banner-frame.skiptranslate,
          iframe.goog-te-banner-frame,
          .goog-te-balloon-frame,
          .goog-te-menu-frame,
          .goog-te-menu2-frame,
          .goog-te-gadget-icon,
          .goog-te-spinner-pos,
          #goog-gt-tt,
          .goog-tooltip,
          .goog-tooltip:hover {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            height: 0 !important;
            width: 0 !important;
          }

          /* Hide the 'Show Original' text on hover and highlights */
          .goog-text-highlight {
            background-color: transparent !important;
            box-shadow: none !important;
            border: none !important;
          }
  
            /* General gadget hiding */
            .skiptranslate.goog-te-gadget {
              display: none !important;
            }
            
            /* Prevent the 'translated' bar from appearing or overlapping */
            .translated-ltr body, .translated-rtl body {
               padding-top: 0px !important;
            }
            .translated-ltr, .translated-rtl {
               margin-top: 0px !important;
               top: 0px !important;
            }
          `}} />
      </head>
      <body style={{ overflowX: "hidden" }}>
        <AuthProvider>
          {/* <VerificationProvider> */}
          <Providers>
            <SoundInitializer />
            <TopLoader />
            <TranslationEngine />
            {children}
          </Providers>
          {/* </VerificationProvider> */}
        </AuthProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "OBAOL",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "A unified operating system for physical commodity and agro-commodity trading.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "OBAOL",
              url: BASE_URL,
              logo: `${BASE_URL}/logo.png`,
              description: DEFAULT_DESCRIPTION,
              areaServed: [
                { "@type": "Country", name: "India" },
                { "@type": "Country", name: "United Arab Emirates" },
                { "@type": "Country", name: "Saudi Arabia" },
                { "@type": "Place", name: "European Union" },
                { "@type": "Country", name: "United States" },
              ],
              serviceArea: `Primary market: ${PRIMARY_MARKET}. Expanding globally.`,
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: BASE_URL,
              areaServed: [
                { "@type": "Country", name: "India" },
                { "@type": "Country", name: "United Arab Emirates" },
                { "@type": "Country", name: "Saudi Arabia" },
                { "@type": "Place", name: "European Union" },
                { "@type": "Country", name: "United States" },
              ],
              serviceArea: `Primary market: ${PRIMARY_MARKET}. Expanding globally.`,
              potentialAction: {
                "@type": "SearchAction",
                target: `${BASE_URL}/product?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

      </body>
    </html>
  );
}
