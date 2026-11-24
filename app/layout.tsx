import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LaunchmateProvider } from "@/components/LaunchmateProvider";
import PrototypeBanner from "@/components/PrototypeBanner";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", weight: ["400", "500", "600", "700"] });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Launchmate",
  description: "Describe your idea and watch your agent build the storefront, products and infrastructure.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <LaunchmateProvider>
          <PrototypeBanner />
          {children}
        </LaunchmateProvider>
      </body>
    </html>
  );
}
