"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Search,
  PlusCircle,
  Building2,
  MapPin,
  ShieldCheck,
  Trash2,
  Loader2,
  Users,
  ArrowRightLeft,
  Briefcase,
  Sparkles,
  ArrowRight,
  Sprout,
  TrendingUp,
  RefreshCw,
  Layers,
  CheckCircle2,
  Wheat,
  Globe2,
  Sun,
  Trees,
  Droplets,
} from "lucide-react";
import Link from "next/link";
import { AddResourceModal } from "@/components/AddResourceModal";
import { PostRequirementModal } from "@/components/PostRequirementModal";
import {
  fetchResources,
  fetchRequirements,
  deleteResource,
  deleteRequirement,
  Resource,
  Requirement,
} from "@/lib/api";
import { useCompany } from "@/lib/CompanyContext";

export default function Dashboard() {
  const {
    companies,
    activeCompany,
    setActiveCompany,
    openAddCompanyModal,
    loading: companyLoading,
  } = useCompany();

  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [allRequirements, setAllRequirements] = useState<Requirement[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [showAddResource, setShowAddResource] = useState(false);
  const [showPostReq, setShowPostReq] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [resData, reqData] = await Promise.all([
        fetchResources(),
        fetchRequirements(),
      ]);

      setAllResources(resData);
      setAllRequirements(reqData);

      if (activeCompany) {
        setResources(resData.filter((r) => r.companyId === activeCompany.id));
        setRequirements(reqData.filter((r) => r.companyId === activeCompany.id));
      } else {
        setResources(resData);
        setRequirements(reqData);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCompany]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleModalClose = () => {
    setShowAddResource(false);
    setShowPostReq(false);
    fetchData();
  };

  const handleDeleteResource = async (e: React.MouseEvent, resId: string, resName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${resName}"?`)) return;

    setDeletingId(resId);
    try {
      await deleteResource(resId);
      setResources((prev) => prev.filter((r) => r.id !== resId));
      setAllResources((prev) => prev.filter((r) => r.id !== resId));
    } catch {
      alert("Failed to delete resource. Please try again.");
    } finally {
      setDeletingId(null);
      fetchData();
    }
  };

  const handleDeleteRequirement = async (e: React.MouseEvent, reqId: string, reqName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete requirement "${reqName}"?`)) return;

    setDeletingId(reqId);
    try {
      await deleteRequirement(reqId);
      setRequirements((prev) => prev.filter((r) => r.id !== reqId));
      setAllRequirements((prev) => prev.filter((r) => r.id !== reqId));
    } catch {
      alert("Failed to delete requirement. Please try again.");
    } finally {
      setDeletingId(null);
      fetchData();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "AG";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (loading || companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin shadow-lg shadow-emerald-500/20" />
          <p className="text-emerald-200 font-medium font-outfit text-lg">
            Synchronizing smart agritech & bio-byproduct neural vectors...
          </p>
        </div>
      </div>
    );
  }

  if (!activeCompany && companies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="agri-card rounded-3xl p-10 max-w-lg text-center space-y-6 border border-emerald-500/20 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Sprout className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white font-outfit">
              No Farms or Enterprises Registered
            </h2>
            <p className="text-slate-300 text-sm font-sans leading-relaxed">
              Enroll agricultural partners, biomass processors, and factories to start AI regenerative bio-byproduct exchanges.
            </p>
          </div>
          <button
            onClick={openAddCompanyModal}
            className="agri-btn-primary w-full shadow-lg"
          >
            <span>+ Enroll Multiple Organizations</span>
            <span className="agri-arrow-circle">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {showAddResource && activeCompany && (
        <AddResourceModal companyId={activeCompany.id} onClose={handleModalClose} />
      )}
      {showPostReq && activeCompany && (
        <PostRequirementModal companyId={activeCompany.id} onClose={handleModalClose} />
      )}

      {/* ============================================================ */}
      {/* 1. DELISAS AGRICULTURE HERO SECTION                          */}
      {/* ============================================================ */}
      <section className="relative pt-6 sm:pt-10 pb-6 overflow-hidden">
        {/* Floating Stat Badges - Nature & Agritech theme */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="agri-pill bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 animate-agri-float">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Regenerative Bioeconomy</span>
          </div>
          <div className="agri-pill bg-[#f59e0b]/15 border border-[#f59e0b]/25 text-[#fcd34d] animate-agri-float-delayed">
            <Wheat className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>38,400+ MT Agri-Biomass Diverted</span>
          </div>
          <div className="agri-pill bg-teal-500/15 border border-teal-500/25 text-teal-300 animate-agri-float">
            <Droplets className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Soil Carbon & Water Optimization</span>
          </div>
        </div>

        {/* Hero Title & Editorial Slogan */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white font-outfit leading-[1.08]">
            Cultivating circular value from <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-[#f59e0b] bg-clip-text text-transparent underline decoration-emerald-400/30 decoration-wavy decoration-2">
              agricultural & industrial byproducts.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-sans leading-relaxed font-normal">
            Circula pairs crop residues, biomass, and industrial waste streams with circular manufacturers and regenerative soil buyers 24/7.
          </p>

          {/* Delisas Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/matches"
              className="agri-btn-primary group"
            >
              <span>Explore Bio-Matches</span>
              <span className="agri-arrow-circle">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <button
              onClick={() => setShowAddResource(true)}
              className="agri-btn-harvest"
            >
              <Wheat className="w-4 h-4 text-white" />
              <span>List Agri-Biomass / Byproduct</span>
            </button>

            <button
              onClick={() => setShowPostReq(true)}
              className="agri-btn-secondary"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Source Raw Materials</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. DELISAS SMART AGRITECH BENTO FLOW                         */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bento 1: Regenerative Bioeconomy Flow */}
        <div className="lg:col-span-2 agri-card p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-outfit">
                    Regenerative Biomass Loop
                  </h3>
                  <p className="text-xs text-emerald-300/80">
                    Real-time AI matching between agricultural residues & bio-processors
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Bio-Matcher Active
              </span>
            </div>

            {/* 3-Node Visual Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              {/* Origin Agri Stream */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-emerald-500/15 relative">
                <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider block mb-1">
                  1. Crop Residue / Byproduct
                </span>
                <p className="text-sm font-bold text-white">Sugarcane Bagasse & Husk</p>
                <p className="text-xs text-slate-400 mt-1">1,200 MT / harvest cycle</p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-300">
                  <Sprout className="w-3 h-3 text-[#f59e0b]" /> Cauvery Agro Farms
                </div>
              </div>

              {/* AI Conversion Core */}
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 relative flex flex-col justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-emerald-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-xs font-black text-white font-outfit">96.2% Synergy Parity</p>
                <p className="text-[10px] text-emerald-300 mt-0.5">Bio-Char & Green Fuel Vector</p>
              </div>

              {/* Demand Node */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-emerald-500/15 relative">
                <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block mb-1">
                  2. Bio-Economy Buyer
                </span>
                <p className="text-sm font-bold text-white">EcoPack Molded Pulp</p>
                <p className="text-xs text-slate-400 mt-1">1,000 MT procurement</p>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-teal-300">
                  <Building2 className="w-3 h-3 text-teal-400" /> Green Fiber Tech
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero Stubble Burning
              </span>
              <span className="flex items-center gap-1.5 text-[#fcd34d]">
                <TrendingUp className="w-3.5 h-3.5 text-[#f59e0b]" /> 3.2x Farm Revenue
              </span>
            </div>
            <Link
              href="/matches"
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              Explore All Bio-Matches →
            </Link>
          </div>
        </div>

        {/* Bento 2: Active Organization Profile Capsule */}
        <div className="agri-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                Active Perspective
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                {activeCompany?.verificationStatus || "Verified"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-emerald-500/30 flex-shrink-0">
                {getInitials(activeCompany?.name)}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-white truncate font-outfit">
                  {activeCompany?.name || "Select Profile"}
                </h2>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="w-3 h-3 text-emerald-400" /> {activeCompany?.industry}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-teal-400" /> {activeCompany?.location}
                </p>
              </div>
            </div>

            {/* Micro Stats for active session */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-emerald-500/15">
                <p className="text-[10px] text-emerald-300 font-semibold uppercase">Offered Supply</p>
                <p className="text-xl font-black text-white font-outfit mt-0.5">{resources.length}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-emerald-500/15">
                <p className="text-[10px] text-emerald-300 font-semibold uppercase">Active Demands</p>
                <p className="text-xl font-black text-white font-outfit mt-0.5">{requirements.length}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-emerald-500/15 flex flex-col gap-2">
            <button
              onClick={() => setShowAddResource(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              + List Organic / Byproduct Stream
            </button>
            <button
              onClick={() => setShowPostReq(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-bold transition-all border border-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              + Post Sourcing Need
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SUPPLY & DEMAND BENTO COLUMNS                             */}
      {/* ============================================================ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Bento Column: My Supply Byproducts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-outfit">
                  Offered Biomass & Byproducts
                </h2>
                <p className="text-[11px] text-emerald-300/80">Active streams listed by this organization</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              {resources.length} Listed
            </span>
          </div>

          <div className="space-y-3">
            {resources.map((res) => (
              <div
                key={res.id}
                className="agri-card p-5 border border-emerald-500/15 hover:border-emerald-400/40 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors font-outfit">
                        {res.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
                        {res.quality}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-400" /> {res.location}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1.5">
                    <div>
                      <p className="font-extrabold text-base text-white font-outfit">
                        {res.quantity}{" "}
                        <span className="text-xs font-normal text-slate-400">{res.unit}</span>
                      </p>
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {res.price === 0 ? "Free Exchange" : `₹${res.price}/${res.unit}`}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteResource(e, res.id, res.name)}
                      disabled={deletingId === res.id}
                      title="Delete resource"
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      {deletingId === res.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {resources.length === 0 && (
              <div className="agri-glass rounded-3xl p-8 text-center space-y-3 border-dashed border-emerald-500/25">
                <Sprout className="w-8 h-8 mx-auto text-emerald-500/50" />
                <p className="text-sm text-slate-300 font-sans">
                  No materials listed for {activeCompany?.name || "this organization"}.
                </p>
                <button
                  onClick={() => setShowAddResource(true)}
                  className="text-xs font-bold text-emerald-400 hover:underline"
                >
                  + Add your first biomass or byproduct
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Bento Column: My Demands */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-outfit">
                  Sourcing Demands
                </h2>
                <p className="text-[11px] text-teal-300/80">Raw inputs your organization seeks</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold">
              {requirements.length} Needed
            </span>
          </div>

          <div className="space-y-3">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="agri-card p-5 border border-emerald-500/15 hover:border-teal-400/40 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white group-hover:text-teal-300 transition-colors font-outfit">
                        {req.materialType}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
                        {req.quality}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      Required by: <strong className="text-slate-200">{req.requiredDate}</strong>
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1.5">
                    <div>
                      <p className="font-extrabold text-base text-white font-outfit">
                        {req.quantity}{" "}
                        <span className="text-xs font-normal text-slate-400">{req.unit}</span>
                      </p>
                      <span className="text-[11px] font-bold text-teal-300 bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        Actively Procuring
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteRequirement(e, req.id, req.materialType)}
                      disabled={deletingId === req.id}
                      title="Delete requirement"
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      {deletingId === req.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {requirements.length === 0 && (
              <div className="agri-glass rounded-3xl p-8 text-center space-y-3 border-dashed border-emerald-500/25">
                <Search className="w-8 h-8 mx-auto text-emerald-500/50" />
                <p className="text-sm text-slate-300 font-sans">
                  No sourcing requirements posted for {activeCompany?.name || "this organization"}.
                </p>
                <button
                  onClick={() => setShowPostReq(true)}
                  className="text-xs font-bold text-teal-300 hover:underline"
                >
                  + Post your first sourcing requirement
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. NETWORK ECOSYSTEM & DIRECTORY BENTO                       */}
      {/* ============================================================ */}
      <section className="agri-card p-6 sm:p-8 space-y-8 border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/15">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white font-outfit">
                Agritech & Enterprise Network Directory
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Live statistics and perspective switching across registered farms, bio-refineries, and industrial partners
            </p>
          </div>
          
          <button
            onClick={openAddCompanyModal}
            className="self-start sm:self-auto agri-btn-primary text-xs py-2 px-4"
          >
            <span>+ Add Multiple Organizations</span>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <PlusCircle className="w-3 h-3" />
            </span>
          </button>
        </div>

        {/* 4 Metric Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-emerald-500/15">
            <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-outfit">{companies.length}</p>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-1">
              Registered Farms & Hubs
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-emerald-500/15">
            <p className="text-3xl sm:text-4xl font-black text-[#f59e0b] font-outfit">{allResources.length}</p>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-1">
              Active Bio-Streams
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-emerald-500/15">
            <p className="text-3xl sm:text-4xl font-black text-teal-300 font-outfit">{allRequirements.length}</p>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-1">
              Procurement Needs
            </p>
          </div>
          <Link
            href="/matches"
            className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors block group"
          >
            <p className="text-3xl sm:text-4xl font-black text-white font-outfit flex items-center justify-center gap-1.5">
              <Sparkles className="w-6 h-6 text-emerald-400" /> AI
            </p>
            <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
              View Bio-Matches →
            </p>
          </Link>
        </div>

        {/* Organization Directory Cards */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">
            Instant Perspective Switcher
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => {
              const isSelected = activeCompany?.id === c.id;
              const companyResCount = allResources.filter((r) => r.companyId === c.id).length;
              const companyReqCount = allRequirements.filter((r) => r.companyId === c.id).length;

              return (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-400/50 ring-2 ring-emerald-400/20 shadow-lg shadow-emerald-500/15"
                      : "bg-white/[0.03] border-emerald-500/15 hover:border-emerald-500/30 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-sm text-white font-outfit">{c.name}</h5>
                        <p className="text-[11px] text-emerald-300/80 mt-0.5">
                          {c.industry} • {c.location}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex-shrink-0">
                        {c.verificationStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span>
                        Supply: <strong className="text-emerald-400">{companyResCount}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Demand: <strong className="text-teal-300">{companyReqCount}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveCompany(c)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                        : "bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 border border-emerald-500/20"
                    }`}
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    {isSelected ? "Active Session" : "Switch to this Profile"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
