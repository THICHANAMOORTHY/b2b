"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, Settings, ChevronDown, Plus, Check } from "lucide-react";
import { useCompany } from "@/lib/CompanyContext";

export function Header() {
  const { companies, activeCompany, setActiveCompany, openAddCompanyModal } = useCompany();
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "CI";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-5">
        <button className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors">
          Help
        </button>

        <button className="relative p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-full transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563EB] rounded-full ring-2 ring-white" />
        </button>

        <button className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-full transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-[#E2E8F0]" />

        {/* Company / User Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-[#F1F5F9] transition-colors border border-transparent hover:border-[#E2E8F0]"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E40AF] to-[#3B82F6] flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {getInitials(activeCompany?.name)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-[#0F172A] leading-tight max-w-[120px] truncate">
                {activeCompany?.name || "Perspective"}
              </p>
              <p className="text-[10px] text-[#64748B] leading-none">
                {activeCompany?.location || "Chennai"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>

          {/* Dropdown Menu */}
          {isCompanyDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[#F1F5F9] mb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Switch Industrial Node
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                {companies.map((company) => {
                  const isSelected = activeCompany?.id === company.id;
                  return (
                    <button
                      key={company.id}
                      onClick={() => {
                        setActiveCompany(company);
                        setIsCompanyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-[#EFF6FF] text-[#2563EB] font-bold"
                          : "hover:bg-[#F8FAFC] text-[#0F172A]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                            isSelected
                              ? "bg-[#2563EB] text-white"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {getInitials(company.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{company.name}</p>
                          <p className="text-[10px] text-[#94A3B8]">{company.location}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] mt-1">
                <button
                  onClick={() => {
                    setIsCompanyDropdownOpen(false);
                    openAddCompanyModal();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#2563EB] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enroll Organizations</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
