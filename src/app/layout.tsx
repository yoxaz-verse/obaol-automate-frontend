import "./globals.css";
import "./public-ui.css";
import "react-toastify/dist/ReactToastify.css";
import PublicPageScope from "@/components/public/PublicPageScope";
import type { Metadata } from "next";
import { PublicProviders } from "./public-provider";
import { BASE_URL, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, GEO_KEYWORDS, PRIMARY_MARKET, SITE_NAME } from "@/utils/seo";
import AnalyticsTracker from "@/components/ui/AnalyticsTracker";
import { Suspense } from "react";
import { BUSINESS_IDENTITY, ORGANIZATION_SAME_AS } from "@/utils/businessIdentity";
import localFont from "next/font/local";
import DesktopUpdateBanner from "@/components/desktop/DesktopUpdateBanner";

const obaolFont = localFont({
  src: "./fonts/plus-jakarta-sans-latin.woff2",
  weight: "200 800",
  style: "normal",
  display: "optional",
  variable: "--font-obaol",
});


export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "B2B Bulk Trade Execution Platform | OBAOL Supreme",
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
    title: "B2B Bulk Trade Execution Platform | OBAOL Supreme",
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/social/obaol-share-v2.png",
        width: 1200,
        height: 630,
        alt: "OBAOL Commodity Trade Execution System",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "B2B Bulk Trade Execution Platform | OBAOL Supreme",
    description: DEFAULT_DESCRIPTION,
    images: ["/social/obaol-share-v2.png"],
  },

  category: "Business",
  applicationName: "OBAOL",
  appleWebApp: {
    capable: true,
    title: "OBAOL",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", href: "/favicon.ico", type: "image/x-icon" },
      { url: "/icons/obaol-icon-v2-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/obaol-icon-v2-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/obaol-icon-v2-48.png", sizes: "48x48", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", href: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "OBAOL",
    "apple-mobile-web-app-status-bar-style": "default",
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eee9df" },
    { media: "(prefers-color-scheme: dark)", color: "#1b2632" },
  ],
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
      className={`${obaolFont.variable} text-foreground`}
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
        <DesktopUpdateBanner />
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <PublicProviders>
          <div id="main-content" tabIndex={-1}><PublicPageScope>{children}</PublicPageScope></div>
        </PublicProviders>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${BASE_URL}/#organization`,
              name: BUSINESS_IDENTITY.legalName,
              url: BASE_URL,
              logo: `${BASE_URL}/logo.png`,
              description: DEFAULT_DESCRIPTION,
              foundingDate: BUSINESS_IDENTITY.foundingDate,
              email: BUSINESS_IDENTITY.email,
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  email: BUSINESS_IDENTITY.email,
                  areaServed: "IN",
                  availableLanguage: ["en"],
                },
              ],
              address: {
                "@type": "PostalAddress",
                ...BUSINESS_IDENTITY.address,
              },
              areaServed: [
                { "@type": "Country", name: "India" },
                { "@type": "Country", name: "United Arab Emirates" },
                { "@type": "Country", name: "Saudi Arabia" },
                { "@type": "Place", name: "European Union" },
                { "@type": "Country", name: "United States" },
              ],
              serviceArea: `Primary market: ${PRIMARY_MARKET}. Expanding globally.`,
              sameAs: ORGANIZATION_SAME_AS,
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${BASE_URL}/#website`,
              name: SITE_NAME,
              url: BASE_URL,
              publisher: { "@id": `${BASE_URL}/#organization` },
              areaServed: [
                { "@type": "Country", name: "India" },
                { "@type": "Country", name: "United Arab Emirates" },
                { "@type": "Country", name: "Saudi Arabia" },
                { "@type": "Place", name: "European Union" },
                { "@type": "Country", name: "United States" },
              ],
              serviceArea: `Primary market: ${PRIMARY_MARKET}. Expanding globally.`,
            }),
          }}
        />

      </body>
    </html>
  );
}
