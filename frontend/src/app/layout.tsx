import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/Providers";
import Link from "next/link";
import { Sprout, ShieldCheck, HeartHandshake, Trees } from "lucide-react";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Circula — Smart Agriculture & Bioeconomy Platform",
  description:
    "AI-powered regenerative agriculture & industrial bio-byproduct exchange network. Transforming organic crop residue and industrial streams into high-value circular resources.",
  keywords: ["agriculture", "circular economy", "biomass exchange", "agritech", "bioeconomy", "soil carbon", "AI matching"],
  openGraph: {
    title: "Circula — Smart Agriculture & Bioeconomy Platform",
    description: "AI-powered bioeconomy & industrial circularity network.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable} ${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="font-outfit bg-[#071910] text-[#f3f7f4] antialiased min-h-screen flex flex-col selection:bg-[#10b981] selection:text-white relative overflow-x-hidden">
        
        {/* Subtle Organic Forest ambient background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-emerald-500/15 via-[#10b981]/10 to-transparent blur-[130px] rounded-full" />
          <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] bg-[#f59e0b]/8 blur-[140px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 blur-[160px] rounded-full" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#34d39908_1px,transparent_1px),linear-gradient(to_bottom,#34d39908_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_65%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <Providers>
          <Navbar />
          <main className="flex-1 relative z-10 w-full">
            {children}
          </main>
          
          {/* Delisas Agriculture Elevated Footer */}
          <footer className="relative z-10 border-t border-emerald-500/15 bg-[#05130c]/90 backdrop-blur-2xl py-14 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <Sprout className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white font-outfit">
                      Circula<span className="text-emerald-400">.</span>
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm max-w-sm font-sans leading-relaxed">
                    The autonomous smart agriculture & bio-circularity exchange. We match crop residue, bio-mass, and industrial byproducts with 98.4% algorithmic precision.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Regenerative Bioeconomy AI Live
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 font-outfit">
                    Circularity Network
                  </h4>
                  <ul className="space-y-2.5 text-sm font-medium text-slate-300">
                    <li>
                      <Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                        Agritech Dashboard & Feed
                      </Link>
                    </li>
                    <li>
                      <Link href="/marketplace" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                        Bio & Material Marketplace
                      </Link>
                    </li>
                    <li>
                      <Link href="/matches" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                        AI Synergy Matches
                      </Link>
                    </li>
                    <li>
                      <Link href="/exchange" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                        Logistics & Smart Escrow
                      </Link>
                    </li>
                    <li>
                      <Link href="/impact" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                        Soil & Carbon Impact
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 font-outfit">
                    Standards & Certifications
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-400">
                    <li className="flex items-center gap-2 text-slate-300">
                      <Trees className="w-4 h-4 text-emerald-400" /> Regenerative Organic Certified
                    </li>
                    <li className="flex items-center gap-2 text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-[#f59e0b]" /> ISO 14044 LCA Life Cycle Protocol
                    </li>
                    <li className="flex items-center gap-2 text-slate-300">
                      <HeartHandshake className="w-4 h-4 text-teal-400" /> Verified Biofuel & Biomass Index
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-emerald-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-sans">
                <p>© 2026 Circula Agritech & Bioeconomy Platform. Handcrafted with Delisas design aesthetic.</p>
                <div className="flex items-center gap-6">
                  <span className="hover:text-slate-300 cursor-pointer">Soil & Water Safety</span>
                  <span className="hover:text-slate-300 cursor-pointer">Carbon Offset Verification</span>
                  <span className="hover:text-slate-300 cursor-pointer">API Integration</span>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
