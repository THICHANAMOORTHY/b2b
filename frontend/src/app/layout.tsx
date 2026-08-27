import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Circula — B2B Circular Economy Marketplace",
  description:
    "AI-powered industrial circularity network that converts corporate byproducts into dynamically matched resources and quantifies environmental impact.",
  keywords: ["circular economy", "B2B marketplace", "waste reduction", "sustainability", "AI matching"],
  openGraph: {
    title: "Circula — B2B Circular Economy Marketplace",
    description: "AI-powered industrial circularity network",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 py-6 mt-auto">
            <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Circula</span>
                <span>— Powering industrial circular economy with AI</span>
              </div>
              <span>© 2026 Circula. Built for Hackathon.</span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
