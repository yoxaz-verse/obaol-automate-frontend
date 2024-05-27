import "../styles/global.css";
import type { Metadata } from "next";
import { Providers } from "./provider";
import Template from "./template";
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
      <body style={{ overflowX: 'hidden' }}>
        <Providers>
          <Template>
            {children}
          </Template>
        </Providers>
      </body>
    </html>
  );
}
