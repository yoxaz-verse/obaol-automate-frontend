import "../styles/global.css";
import type { Metadata } from "next";
import { Providers } from "./provider";
import { IBM_Plex_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { VerificationProvider } from "@/context/VerificationContext";
import Script from "next/script";

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
  metadataBase: new URL("https://obaol.com"),

  title: {
    default: "OBAOL Supreme — Commodity Trade Execution System",
    template: "%s | OBAOL Supreme",
  },

  description:
    "OBAOL Supreme is a software-led commodity trade execution system combining online coordination with on-ground support. We help buyers find verified suppliers, assist suppliers in reaching genuine buyers, and support documentation, logistics, packaging, and execution until trade closure.",

  keywords: [
    "commodity trade execution",
    "agro commodity trade support",
    "buyer supplier coordination",
    "commodity sourcing system",
    "supplier buyer verification",
    "import export trade execution",
    "commodity logistics coordination",
    "trade documentation support",
    "physical commodity trading system",
  ],

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

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://obaol.com",
    siteName: "OBAOL",
    title: "OBAOL Supreme — Where Commodity Trades Get Executed",
    description:
      "A hybrid online and offline system for commodity trade execution. OBAOL supports sourcing, buyer–supplier coordination, documentation, logistics, packaging, and on-ground execution oversight.",
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
    description:
      "Software-led coordination with real-world execution support for physical commodity trades.",
    images: ["/logo.png"],
  },

  category: "Business",
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

import NavigationProgressBar from "@/components/NavigationProgressBar";

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
        {/* Google Tag Manager */}
        {GTM_ID && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
        )}
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
        <NavigationProgressBar />
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{
                display: "none",
                visibility: "hidden",
              }}
            />
          </noscript>
        )}
        <AuthProvider>
          {/* <VerificationProvider> */}
          <Providers>{children}</Providers>
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
              url: "https://obaol.com",
              logo: "https://obaol.com/logo.png",
              description:
                "Execution-focused commodity trade operating system for agro and physical commodities.",
              sameAs: [],
            }),
          }}
        />

      </body>
    </html>
  );
}
