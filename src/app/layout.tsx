import "../styles/global.css";
import type { Metadata } from "next";
import { Providers } from "./provider";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import { VerificationProvider } from "@/context/VerificationContext";

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OBAOL Supreme",
  description: "Be part of Supremacy in Trading Industry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-neutral-950">
      <body className={inter.className} style={{ overflowX: "hidden" }}>
        <AuthProvider>
          <VerificationProvider>
            {" "}
            {/* ← wrap here */}
            <Providers>{children}</Providers>
          </VerificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
