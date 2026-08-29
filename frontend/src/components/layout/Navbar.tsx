"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sprout,
  LayoutDashboard,
  Store,
  Truck,
  LineChart,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  Check,
  Search,
  ArrowRight,
  Leaf,
  Sparkles,
} from "lucide-react";
import { useCompany } from "@/lib/CompanyContext";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "AI Matches", href: "/matches", icon: Sparkles },
  { name: "Exchange", href: "/exchange", icon: Truck },
  { name: "Soil & Impact", href: "/impact", icon: LineChart },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { companies, activeCompany, setActiveCompany, openAddCompanyModal } = useCompany();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "AG";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-3.5 z-50 w-full px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="agri-glass-pill rounded-full px-3.5 sm:px-5 py-2.5 flex items-center justify-between gap-2 shadow-2xl transition-all duration-300">
          
          {/* Brand Logo - Delisas Agriculture style */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-black tracking-tight text-white font-outfit">
                Circula
              </span>
              <span className="text-emerald-400 text-xl font-black">.</span>
            </div>
          </Link>

          {/* Desktop Nav Links - Natural capsule pill bar */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-emerald-500/15">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-300 ${
                    isActive
                      ? "bg-emerald-500/25 text-emerald-300 shadow-sm border border-emerald-500/30"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <item.icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Island */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Indicator Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bio-Matcher Live</span>
            </div>

            {/* Quick Add Company Button */}
            <button
              onClick={openAddCompanyModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-full transition-all duration-300 shadow-sm"
              title="Add Multiple Enterprises / Farms"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Farms & Hubs</span>
            </button>

            {/* Active Company Pill & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-emerald-500/20 transition-all duration-300 group"
                title="Switch Active Session"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-900 border border-emerald-400/30 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                  {getInitials(activeCompany?.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-bold text-slate-100 text-xs leading-none truncate max-w-[110px]">
                    {activeCompany?.name || "Select Profile"}
                  </p>
                  <p className="text-emerald-400/80 text-[10px] truncate max-w-[110px] mt-0.5">
                    {activeCompany?.industry || "Workspace"}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${
                    dropdownOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              {/* Delisas Dark Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-80 agri-glass rounded-3xl shadow-2xl border border-emerald-500/25 py-3 z-50 animate-in fadeSlideIn">
                  <div className="px-4 pb-2.5 border-b border-emerald-500/15 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Enterprise & Farm Session</p>
                      <p className="text-[11px] text-slate-400">Switch operational perspective</p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {companies.length} Active
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div className="px-3 pt-2.5 pb-1.5">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search farm, factory, hub..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.05] border border-emerald-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Companies List */}
                  <div className="max-h-56 overflow-y-auto px-2 py-1 space-y-1">
                    {filteredCompanies.map((c) => {
                      const isSelected = activeCompany?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setActiveCompany(c);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-2xl text-left transition-all ${
                            isSelected
                              ? "bg-emerald-500/20 text-white font-bold border border-emerald-500/40 shadow-sm"
                              : "hover:bg-white/[0.06] text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black ${
                                isSelected
                                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                  : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {getInitials(c.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs truncate font-semibold">{c.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {c.industry} • {c.location}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                    {filteredCompanies.length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-4">No organizations found</p>
                    )}
                  </div>

                  {/* Add Multiple Companies Trigger */}
                  <div className="pt-2 mt-2 border-t border-emerald-500/15 px-3">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        openAddCompanyModal();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      + Add Multiple Organizations
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-full bg-white/[0.06] border border-emerald-500/20 text-slate-300 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="lg:hidden mt-2 p-4 agri-glass rounded-3xl border border-emerald-500/20 space-y-3 shadow-2xl animate-in fadeSlideIn">
            <div className="p-3 bg-white/[0.04] rounded-2xl border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Active Workspace</p>
                <p className="text-sm font-bold text-white">{activeCompany?.name || "None"}</p>
                <p className="text-xs text-slate-400">{activeCompany?.industry}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  openAddCompanyModal();
                }}
                className="text-xs font-bold bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-sm"
              >
                + Add
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                        : "text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
