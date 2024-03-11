import "../styles/global.css";
import type { Metadata } from "next";
// import { Jura } from "next/font/google";
import { Providers } from "./provider";

// const jura = Jura({ subsets: ["latin"] });
//className={jura.className}
export const metadata: Metadata = {
  title: "Activity Tracker",
  description: "Activity Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: "#f5f5f5" }}>
      <body  style={{overflowX:'hidden'}}>
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
