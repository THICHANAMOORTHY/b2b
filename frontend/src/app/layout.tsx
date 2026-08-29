import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  weight: ["500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Circula — Industrial Circularity & B2B Matchmaking",
  description:
    "AI-powered B2B circular economy marketplace connecting secondary raw materials with manufacturers, closing industrial loops and quantifying real-time ESG metrics.",
  keywords: ["circular economy", "industrial symbiosis", "ESG metrics", "AI matching", "secondary raw materials"],
  openGraph: {
    title: "Circula — Industrial Circularity Platform",
    description: "Enterprise B2B circular matchmaking and ESG accounting.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakarta.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-jakarta bg-[#F8FAFC] text-[#0F172A] antialiased min-h-screen flex selection:bg-[#2563EB] selection:text-white">
        <Providers>
          {/* Persistent Left Sidebar */}
          <Sidebar />

          {/* Main App Container */}
          <div className="flex-1 flex flex-col pl-64 min-h-screen">
            {/* Top Header Bar */}
            <Header />

            {/* Main Content Viewport */}
            <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
