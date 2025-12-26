import "../styles/global.css";
import type { Metadata } from "next";
import { Providers } from "./provider";
import { IBM_Plex_Sans, Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { VerificationProvider } from "@/context/VerificationContext";
import Script from "next/script";

// If loading a variable font, you don't need to specify the font weight
const font = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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
    default: "OBAOL Supreme — Commodity Trading Operating System",
    template: "%s | OBAOL Supreme",
  },

  description:
    "OBAOL Supreme is a unified operating system for physical commodity trading, focused on agro commodities, import-export workflows, supplier verification, procurement, logistics, and secure trade execution.",

  keywords: [
    "commodity trading platform",
    "agro commodity trading",
    "physical commodity trading",
    "import export trade system",
    "commodity procurement platform",
    "trade execution system",
    "commodity logistics management",
    "supplier verification platform",
    "commodity trading without capital",
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
    title: "OBAOL Supreme — Commodity Trading Operating System",
    description:
      "A standardized operating system for agro and physical commodity trading. Source, verify, procure, package, transport, and execute trades on one system.",
    images: [
      {
        url: "/og-image.png", // MUST exist
        width: 1200,
        height: 630,
        alt: "OBAOL Commodity Trading Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "OBAOL — Commodity Trading Operating System",
    description:
      "A unified operating system for agro and physical commodity trading.",
    images: ["/og-image.png"],
  },

  category: "Business",
};


const GTM_ID = "G-F4YK8H3Q4L";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" 
    className={`${font.className}  + bg-neutral-950`}
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
      </head>
      <body  style={{ overflowX: "hidden" }}>
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
          <VerificationProvider>
            <Providers>{children}</Providers>
          </VerificationProvider>
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

      </body>
    </html>
  );
}
