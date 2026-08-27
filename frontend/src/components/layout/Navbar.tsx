"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf,
  LayoutDashboard,
  Store,
  Sparkles,
  Truck,
  LineChart,
  Menu,
  X,
  Bell,
  Building2,
  ChevronDown,
  PlusCircle,
  Check,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useCompany } from "@/lib/CompanyContext";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "AI Matches", href: "/matches", icon: Sparkles },
  { name: "Exchange", href: "/exchange", icon: Truck },
  { name: "Impact", href: "/impact", icon: LineChart },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { companies, activeCompany, setActiveCompany, openAddCompanyModal } = useCompany();

  // Close dropdown when clicking outside
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
    if (!name) return "CO";
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
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="mr-8 flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent">
            Circula
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex flex-1 items-center gap-1 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-green-50 text-green-700 font-semibold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side: Session Switcher & Add Companies button */}
        <div className="ml-auto flex items-center gap-3">
          {/* Quick Add Multiple Companies button */}
          <button
            onClick={openAddCompanyModal}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Companies</span>
          </button>

          {/* Notification bell */}
          <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Company Session Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group"
              title="Switch Active Company Session"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-950 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {getInitials(activeCompany?.name)}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-slate-800 leading-none truncate max-w-[130px]">
                    {activeCompany?.name || "Select Company"}
                  </p>
                </div>
                <p className="text-slate-400 text-[10px] mt-0.5 truncate max-w-[130px]">
                  {activeCompany?.industry || "Active Session"}
                </p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  dropdownOpen ? "rotate-180 text-slate-700" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Company Sessions</p>
                    <p className="text-[11px] text-slate-400">Switch workspace profile</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {companies.length} Total
                  </span>
                </div>

                {/* Search */}
                <div className="px-3 pt-2 pb-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search company session..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Company list */}
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
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              isSelected
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {getInitials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs truncate font-medium">{c.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {c.industry} • {c.location}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                  {filteredCompanies.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-4">No companies found</p>
                  )}
                </div>

                {/* Add Multiple Companies Trigger */}
                <div className="pt-2 mt-1 border-t border-slate-100 px-2">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      openAddCompanyModal();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl shadow-sm transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + Add Multiple Companies
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 border-t border-slate-100 space-y-2 bg-white">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-slate-400 font-medium">Current Session</p>
              <p className="text-sm font-bold text-slate-800">{activeCompany?.name || "None"}</p>
              <p className="text-xs text-slate-500">{activeCompany?.industry}</p>
            </div>
            <button
              onClick={() => {
                setMenuOpen(false);
                openAddCompanyModal();
              }}
              className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-sm"
            >
              + Add Companies
            </button>
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-green-50 text-green-700 font-semibold" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
