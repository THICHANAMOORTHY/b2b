"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Sparkles,
  ArrowLeftRight,
  Leaf,
  Plus,
  Settings,
  HelpCircle,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { AddResourceModal } from "@/components/AddResourceModal";
import { useCompany } from "@/lib/CompanyContext";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "Matches", href: "/matches", icon: Sparkles },
  { name: "Exchange Tracker", href: "/exchange", icon: ArrowLeftRight },
  { name: "ESG Impact", href: "/impact", icon: Leaf },
];

export function Sidebar() {
  const pathname = usePathname();
  const { activeCompany } = useCompany();
  const [showNewListingModal, setShowNewListingModal] = useState(false);

  return (
    <>
      {showNewListingModal && activeCompany && (
        <AddResourceModal
          companyId={activeCompany.id}
          onClose={() => setShowNewListingModal(false)}
        />
      )}

      <aside className="w-64 bg-white border-r border-[#E2E8F0] min-h-screen flex flex-col justify-between p-4 fixed left-0 top-0 bottom-0 z-30 select-none">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E40AF] to-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#0F172A] font-outfit leading-none">
                Circula
              </h1>
              <p className="text-[11px] text-[#64748B] font-medium mt-1">
                Industrial Circularity
              </p>
            </div>
          </div>

          {/* New Listing Action Button */}
          <div className="mb-6 px-1">
            <button
              onClick={() => setShowNewListingModal(true)}
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all duration-150"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Listing</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/25"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] font-medium"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-[#64748B]"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Links */}
        <div className="pt-4 border-t border-[#E2E8F0] space-y-1 px-1">
          <button className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-sm text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] font-medium transition-colors">
            <Settings className="w-4 h-4 text-[#64748B]" />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-sm text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] font-medium transition-colors">
            <HelpCircle className="w-4 h-4 text-[#64748B]" />
            <span>Support</span>
          </button>
        </div>
      </aside>
    </>
  );
}
