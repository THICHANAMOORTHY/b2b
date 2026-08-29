import { Filter, Search, MapPin, Package, ArrowRight, Sprout, Wheat, Sparkles, Trees } from 'lucide-react';
import Link from 'next/link';
import { fetchResources, fetchCompanies } from '@/lib/api';

export default async function Marketplace() {
  const [resources, companies] = await Promise.all([
    fetchResources(),
    fetchCompanies(),
  ]);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header section with Delisas Typography */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-bold">
            <Sprout className="w-3.5 h-3.5" />
            <span>Regenerative Agriculture & Bioeconomy Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-outfit">
            Biomass & Byproduct Index
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-sans max-w-xl">
            Verified agricultural residues, organic feedstocks, and industrial byproducts ready for circular transformation.{' '}
            <span className="font-bold text-emerald-400">{resources.length} active streams</span> cataloged.
          </p>
        </div>

        {/* Search and filter controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <input
              type="text"
              placeholder="Search biomass, crop residue, minerals..."
              className="pl-10 pr-4 py-2.5 bg-white/[0.05] border border-emerald-500/25 rounded-full w-full md:w-80 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-emerald-500/25 rounded-full text-xs font-bold text-slate-200 transition-colors">
            <Filter className="h-3.5 w-3.5 text-emerald-400" /> Filters
          </button>
        </div>
      </div>

      {/* Grid of Delisas Agritech cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => {
          const company = companies.find((c) => c.id === resource.companyId);
          return (
            <div
              key={resource.id}
              className="agri-card overflow-hidden group flex flex-col justify-between border border-emerald-500/20"
            >
              <div>
                {/* Visual Header */}
                <div className="h-44 bg-gradient-to-br from-[#0c2417] via-[#091f13] to-[#071910] p-5 relative flex flex-col justify-between border-b border-emerald-500/15">
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 backdrop-blur-md border border-emerald-500/30">
                      {resource.materialType || 'Bio-Residue'}
                    </span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 font-outfit">
                      {resource.quantity} {resource.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shadow-md">
                      <Wheat className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-300 transition-colors font-outfit leading-tight">
                        {resource.name}
                      </h3>
                      <p className="text-xs text-emerald-300/80">Grade: {resource.quality}</p>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-radial from-emerald-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {resource.location}
                    </span>
                    <span className="font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      {resource.price === 0 ? 'Free Exchange' : `₹${resource.price}/${resource.unit}`}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-emerald-500/15 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Origin Organization:</span>
                      <span className="font-bold text-white truncate max-w-[140px]">{company?.name ?? 'Agri Producer'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Sector:</span>
                      <span className="text-emerald-300">{company?.industry ?? 'Agriculture & Bio-processing'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="p-5 pt-0">
                <Link
                  href="/matches"
                  className="w-full py-2.5 px-4 rounded-full bg-white/[0.06] hover:bg-emerald-600 text-white text-xs font-bold transition-all duration-300 flex items-center justify-between border border-emerald-500/25 hover:border-emerald-500"
                >
                  <span>Check AI Synergy Matches</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}

        {resources.length === 0 && (
          <div className="col-span-3 text-center py-20 agri-glass rounded-3xl border border-dashed border-emerald-500/30">
            <Sprout className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
            <p className="text-slate-300 font-medium">No byproduct or biomass resources listed in marketplace yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
