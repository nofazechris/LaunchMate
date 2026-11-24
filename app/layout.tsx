import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", weight: ["400", "500", "600", "700"] });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Launchmate",
  description: "Start selling online in Nigeria. Launchmate handles the technical setup for you: your store, your address and your products.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
