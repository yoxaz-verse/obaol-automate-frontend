import "../styles/global.css";
import type { Metadata } from "next";
import { Providers } from "./provider";
import Template from "./template";
import { Inter } from 'next/font/google'

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className} style={{ overflowX: 'hidden' }}>
        <Providers>
          <Template>
            {children}
          </Template>
        </Providers>
      </body>
    </html>
  );
}
