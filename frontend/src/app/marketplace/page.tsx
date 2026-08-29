import { Filter, Search, MapPin, ArrowRight, Building2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { fetchResources, fetchCompanies } from '@/lib/api';

export default async function Marketplace() {
  const [resources, companies] = await Promise.all([
    fetchResources(),
    fetchCompanies(),
  ]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">
            MATERIAL CATALOG
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-outfit mt-0.5">
            Secondary Raw Materials & Scrap
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            {resources.length} active verified industrial streams ready for circular procurement.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search materials, metals, polymers..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] shadow-sm"
            />
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] shadow-sm transition-colors">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Grid of Clean SaaS Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((resource) => {
          const company = companies.find((c) => c.id === resource.companyId);
          return (
            <div
              key={resource.id}
              className="saas-card overflow-hidden flex flex-col justify-between hover:border-[#BFDBFE] transition-all group"
            >
              <div className="p-5 space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold uppercase tracking-wider">
                      {resource.materialType || "Industrial"}
                    </span>
                    <h3 className="text-base font-bold text-[#0F172A] mt-1.5 group-hover:text-[#2563EB] transition-colors">
                      {resource.name || resource.materialType}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-[#0F172A] font-outfit">
                      {resource.price === 0 ? "FREE" : `₹${resource.price}`}
                    </span>
                    {resource.price > 0 && (
                      <span className="text-[10px] text-[#64748B] block font-medium">
                        /{resource.unit || "kg"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] space-y-1.5 text-xs text-[#64748B]">
                  <div className="flex items-center justify-between">
                    <span>Available Volume:</span>
                    <span className="font-bold text-[#0F172A]">
                      {resource.quantity?.toLocaleString()} {resource.unit || "kg"}
                    </span>
                  </div>
                  {resource.quality && (
                    <div className="flex items-center justify-between">
                      <span>Quality Grade:</span>
                      <span className="font-semibold text-[#0F172A]">{resource.quality}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Availability:</span>
                    <span className="font-semibold text-[#16A34A]">{resource.availability || "Immediate"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span className="font-medium truncate">{company?.name || "Verified Producer"}</span>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <MapPin className="w-3 h-3 text-[#64748B]" />
                    {resource.location || "Chennai"}
                  </span>
                </div>
              </div>

              <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#2563EB] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Compatible
                </span>
                <Link
                  href="/matches"
                  className="text-xs font-semibold text-[#0F172A] hover:text-[#2563EB] flex items-center gap-1 transition-colors"
                >
                  <span>Request Match</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
