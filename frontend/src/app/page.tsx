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
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  CheckCircle2,
  TrendingUp,
  Leaf,
  Droplets,
  ExternalLink,
  ChevronDown,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { AddResourceModal } from "@/components/AddResourceModal";
import { PostRequirementModal } from "@/components/PostRequirementModal";
import {
  fetchResources,
  fetchRequirements,
  fetchMatches,
  deleteResource,
  deleteRequirement,
  Resource,
  Requirement,
  Match,
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
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [showAddResource, setShowAddResource] = useState(false);
  const [showPostReq, setShowPostReq] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resources" | "requirements">("resources");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [resData, reqData, matchData] = await Promise.all([
        fetchResources(),
        fetchRequirements(),
        fetchMatches(),
      ]);

      setAllResources(resData);
      setAllRequirements(reqData);
      setAllMatches(matchData);

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
    if (!window.confirm(`Are you sure you want to remove "${resName}" from the manifest?`)) return;

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
    if (!name) return "CR";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Filtered resources/requirements
  const filteredResources = resources.filter((r) =>
    (r.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.materialType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequirements = requirements.filter((req) =>
    (req.materialType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top Match computation
  const topMatch = allMatches.length > 0
    ? [...allMatches].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))[0]
    : null;

  const topMatchResource = topMatch
    ? allResources.find((r) => r.id === topMatch.resourceId)
    : null;

  const topMatchRequirement = topMatch
    ? allRequirements.find((req) => req.id === topMatch.requirementId)
    : null;

  const topMatchCompany = topMatchRequirement
    ? companies.find((c) => c.id === topMatchRequirement.companyId)
    : null;

  if (loading || companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#2F6D53] border-t-transparent animate-spin" />
          <p className="text-emerald-300 font-mono-code text-sm">
            INITIALIZING CIRCULA INDUSTRIAL MANIFEST MATRIX...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-ibm-body">
      {showAddResource && activeCompany && (
        <AddResourceModal companyId={activeCompany.id} onClose={handleModalClose} />
      )}
      {showPostReq && activeCompany && (
        <PostRequirementModal companyId={activeCompany.id} onClose={handleModalClose} />
      )}

      {/* ─── INDUSTRIAL HEADER & PERSPECTIVE BAR ─────────────────────────── */}
      <header className="mb-8 rounded-xl border border-emerald-500/20 bg-[#081f14]/90 backdrop-blur-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2F6D53] to-[#1F4A39] border border-emerald-400/30 flex items-center justify-center font-display font-bold text-white text-lg shadow-md shrink-0">
            {getInitials(activeCompany?.name)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
                {activeCompany?.name || "Enterprise Circular Node"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono-code text-[11px] font-semibold">
                ● {activeCompany?.verificationStatus || "VERIFIED"}
              </span>
            </div>
            <p className="font-mono-code text-xs text-emerald-200/70 mt-1 uppercase tracking-wider">
              {activeCompany?.location || "CHENNAI, TN"} &middot; REG. NO. CIR-2026-{(activeCompany?.id || "0417").slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Company Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={activeCompany?.id || ""}
              onChange={(e) => {
                const found = companies.find((c) => c.id === e.target.value);
                if (found) setActiveCompany(found);
              }}
              className="appearance-none bg-[#0a281a] border border-emerald-500/30 text-emerald-100 text-xs font-mono-code rounded-lg px-4 py-2.5 pr-8 hover:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0e271a] text-white">
                  🏢 {c.name} ({c.location})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={openAddCompanyModal}
            className="px-3.5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono-code transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>+ Organizations</span>
          </button>

          <button
            onClick={() => setShowAddResource(true)}
            className="px-4 py-2 rounded-lg bg-[#2F6D53] hover:bg-[#245842] text-white text-xs font-medium font-mono-code transition-all shadow-md flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Resource</span>
          </button>

          <button
            onClick={() => setShowPostReq(true)}
            className="px-4 py-2 rounded-lg bg-[#B96A2C] hover:bg-[#9d5823] text-white text-xs font-medium font-mono-code transition-all shadow-md flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>+ Post Requirement</span>
          </button>
        </div>
      </header>

      {/* ─── 4 INDUSTRIAL KPI DATA PLATES ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="data-plate-dark p-5 pb-7 relative group hover:border-emerald-400/40 transition-all">
          <div className="font-mono-code text-[11px] uppercase tracking-widest text-emerald-300/80">
            Active Resources
          </div>
          <div className="font-display font-bold text-3xl sm:text-4xl mt-2 text-white">
            {resources.length.toString().padStart(2, "0")}
          </div>
          <div className="font-mono-code text-[10px] text-emerald-400/70 mt-1">
            {allResources.length} total across network
          </div>
        </div>

        <div className="data-plate-dark p-5 pb-7 relative group hover:border-emerald-400/40 transition-all">
          <div className="font-mono-code text-[11px] uppercase tracking-widest text-emerald-300/80">
            Sourcing Demands
          </div>
          <div className="font-display font-bold text-3xl sm:text-4xl mt-2 text-amber-400">
            {requirements.length.toString().padStart(2, "0")}
          </div>
          <div className="font-mono-code text-[10px] text-amber-300/70 mt-1">
            {allRequirements.length} network requirements
          </div>
        </div>

        <div className="data-plate-dark p-5 pb-7 relative group hover:border-emerald-400/40 transition-all">
          <div className="font-mono-code text-[11px] uppercase tracking-widest text-emerald-300/80">
            AI Synergy Matches
          </div>
          <div className="font-display font-bold text-3xl sm:text-4xl mt-2 text-[#5B7FBE]">
            {allMatches.length.toString().padStart(2, "0")}
          </div>
          <div className="font-mono-code text-[10px] text-blue-300/70 mt-1">
            &gt; 60% algorithmic confidence
          </div>
        </div>

        <div className="data-plate-dark p-5 pb-7 relative group hover:border-emerald-400/40 transition-all">
          <div className="font-mono-code text-[11px] uppercase tracking-widest text-emerald-300/80">
            Network Integrity
          </div>
          <div className="font-display font-bold text-3xl sm:text-4xl mt-2 text-emerald-400 flex items-center gap-2">
            99.2%
          </div>
          <div className="font-mono-code text-[10px] text-emerald-300/70 mt-1">
            LCA ISO-14044 protocol active
          </div>
        </div>
      </div>

      {/* ─── MAIN 2-COLUMN SECTION ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* LEFT COLUMN: MANIFEST LEDGER (3 cols) */}
        <section className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("resources")}
                className={`font-display font-semibold text-base transition-colors ${
                  activeTab === "resources"
                    ? "text-white border-b-2 border-[#2F6D53] pb-1 -mb-[10px]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                My Surplus Resources ({resources.length})
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setActiveTab("requirements")}
                className={`font-display font-semibold text-base transition-colors ${
                  activeTab === "requirements"
                    ? "text-white border-b-2 border-[#B96A2C] pb-1 -mb-[10px]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Procurement Demands ({requirements.length})
              </button>
            </div>

            {/* Quick search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filter manifest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0a281a] border border-emerald-500/25 rounded-lg px-3 py-1 text-xs text-white placeholder-emerald-200/40 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono-code w-40 sm:w-48"
              />
              <Search className="w-3 h-3 text-emerald-400/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* TAB 1: RESOURCES MANIFEST */}
          {activeTab === "resources" && (
            <div className="space-y-3">
              {filteredResources.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-emerald-500/20 bg-[#081e13]/60 text-center space-y-3">
                  <Package className="w-8 h-8 text-emerald-400/50 mx-auto" />
                  <p className="font-mono-code text-xs text-emerald-200/70">
                    NO SURPLUS RESOURCES LISTED FOR THIS PERSPECTIVE
                  </p>
                  <button
                    onClick={() => setShowAddResource(true)}
                    className="px-4 py-2 rounded-lg bg-[#2F6D53] text-white text-xs font-mono-code hover:bg-[#255a44] transition-colors"
                  >
                    + Add First Resource Listing
                  </button>
                </div>
              ) : (
                filteredResources.map((item) => (
                  <div
                    key={item.id}
                    className={`ledger-row p-4 flex items-center justify-between gap-4 bg-[#0a281a]/90 text-white hover:bg-[#0c2f1f] transition-all ${
                      item.price === 0 ? "free" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-sm text-white truncate">
                          {item.name || item.materialType}
                        </span>
                        {item.quality && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono-code">
                            GRADE: {item.quality}
                          </span>
                        )}
                      </div>
                      <div className="font-mono-code text-[11px] text-emerald-200/60 mt-1 flex flex-wrap items-center gap-2">
                        <span>{item.quantity?.toLocaleString()} {item.unit || "KG"}</span>
                        <span>&middot;</span>
                        <span>TYPE: {item.materialType}</span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" /> {item.location || "Chennai"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3 shrink-0">
                      <div>
                        <div className={`font-mono-code font-bold text-sm ${item.price === 0 ? "text-[#B96A2C]" : "text-white"}`}>
                          {item.price === 0 ? "FREE / SUBSIDIZED" : `₹${item.price}/${item.unit || "kg"}`}
                        </div>
                        <div className="font-mono-code text-[10px] text-emerald-400 mt-0.5">
                          {item.availability || "AVAILABLE NOW"}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteResource(e, item.id, item.name || item.materialType)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-300 transition-colors"
                        title="Delete listing"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: REQUIREMENTS MANIFEST */}
          {activeTab === "requirements" && (
            <div className="space-y-3">
              {filteredRequirements.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-emerald-500/20 bg-[#081e13]/60 text-center space-y-3">
                  <Search className="w-8 h-8 text-amber-400/50 mx-auto" />
                  <p className="font-mono-code text-xs text-amber-200/70">
                    NO ACTIVE SOURCING DEMANDS FOUND
                  </p>
                  <button
                    onClick={() => setShowPostReq(true)}
                    className="px-4 py-2 rounded-lg bg-[#B96A2C] text-white text-xs font-mono-code hover:bg-[#9d5823] transition-colors"
                  >
                    + Post Sourcing Requirement
                  </button>
                </div>
              ) : (
                filteredRequirements.map((req) => (
                  <div
                    key={req.id}
                    className="ledger-row alert p-4 flex items-center justify-between gap-4 bg-[#0a281a]/90 text-white hover:bg-[#0c2f1f] transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-sm text-white truncate">
                          Need: {req.materialType}
                        </span>
                        {req.quality && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono-code">
                            REQ GRADE: {req.quality}
                          </span>
                        )}
                      </div>
                      <div className="font-mono-code text-[11px] text-amber-200/60 mt-1 flex flex-wrap items-center gap-2">
                        <span>TARGET: {req.quantity?.toLocaleString()} {req.unit || "KG"}</span>
                        <span>&middot;</span>
                        <span>DEADLINE: {req.requiredDate || "Immediate"}</span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" /> {req.location || "Chennai"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3 shrink-0">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono-code text-[10px]">
                          <Sparkles className="w-3 h-3" /> MATCHING ACTIVE
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteRequirement(e, req.id, req.materialType)}
                        disabled={deletingId === req.id}
                        className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-300 transition-colors"
                        title="Delete requirement"
                      >
                        {deletingId === req.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: FEATURED AI MATCH & CERTIFIED STAMP (2 cols) */}
        <section className="lg:col-span-2 space-y-6">
          
          {/* TOP CERTIFIED AI MATCH CARD */}
          <div className="p-6 rounded-xl border border-emerald-500/25 bg-[#081e13]/95 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono-code text-[11px] uppercase tracking-widest text-emerald-300">
                Top AI Certified Match
              </div>
              <span className="font-mono-code text-[10px] text-emerald-400/80 bg-emerald-500/15 px-2 py-0.5 rounded">
                LIVE MANIFEST
              </span>
            </div>

            {topMatch ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display font-bold text-base text-white">
                      {topMatchResource?.name || topMatchResource?.materialType || "Copper Wire Scrap"} → {topMatchCompany?.name || "XYZ Components"}
                    </div>
                    <div className="font-mono-code text-[11px] text-emerald-200/70 mt-2 space-y-0.5">
                      <div>QUANTITY: {topMatchRequirement?.quantity || 800} {topMatchRequirement?.unit || "KG"}</div>
                      <div>PROXIMITY: {topMatch.distanceKm ? Math.round(topMatch.distanceKm) : 18} KM</div>
                      <div>EST. FREIGHT: ₹{(topMatch.distanceKm ? Math.round(topMatch.distanceKm * 35) : 640).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* SIGNATURE ROTATED STAMP ELEMENT */}
                  <div className="stamp w-[76px] h-[76px] shrink-0 flex flex-col items-center justify-center text-center leading-none ml-2 border-[#10b981] text-emerald-400 bg-emerald-950/40">
                    <span className="text-[16px] font-bold font-mono-code">{Math.round(topMatch.matchScore || 94)}%</span>
                    <span className="text-[7px] mt-1 uppercase font-bold tracking-wider">Certified</span>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="mt-4 pt-4 border-t border-emerald-500/20 space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono-code text-slate-300">
                      <span>MATERIAL COMPATIBILITY</span>
                      <span className="text-emerald-400 font-bold">98%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-emerald-950/80 mt-1">
                      <div className="h-1.5 rounded-full bg-[#10b981]" style={{ width: "98%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono-code text-slate-300">
                      <span>GEOGRAPHIC RADIUS (PROXIMITY)</span>
                      <span className="text-emerald-400 font-bold">91%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-emerald-950/80 mt-1">
                      <div className="h-1.5 rounded-full bg-[#10b981]" style={{ width: "91%" }} />
                    </div>
                  </div>
                </div>

                <Link
                  href="/matches"
                  className="mt-4 w-full py-2.5 rounded-lg bg-[#2F6D53] hover:bg-[#255842] text-white text-xs font-semibold font-mono-code transition-colors flex items-center justify-center gap-2 shadow-md block text-center"
                >
                  <span>Review AI Match Manifest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <Sparkles className="w-8 h-8 text-emerald-400/50 mx-auto animate-pulse" />
                <p className="font-mono-code text-xs text-emerald-200/70">
                  RUN AI ENGINE TO GENERATE MATCHES
                </p>
                <Link
                  href="/matches"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2F6D53] text-white text-xs font-mono-code hover:bg-[#255842]"
                >
                  Go to AI Matches Hub →
                </Link>
              </div>
            )}
          </div>

          {/* LCA ENVIRONMENTAL IMPACT CAPSULE */}
          <div className="p-5 rounded-xl border border-emerald-500/20 bg-[#081e13]/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-mono-code text-[11px] uppercase tracking-widest text-emerald-300 flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified LCA ESG Metrics</span>
              </div>
              <Link href="/impact" className="text-emerald-400 text-xs font-mono-code hover:underline">
                Full Audit →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="font-mono-code text-[10px] text-emerald-300/70 uppercase">CO₂e Avoidance</div>
                <div className="font-display font-bold text-lg text-emerald-300 mt-0.5">14.8 MT</div>
              </div>
              <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
                <div className="font-mono-code text-[10px] text-teal-300/70 uppercase">Water Conserved</div>
                <div className="font-display font-bold text-lg text-teal-300 mt-0.5">182.4 kL</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono-code text-emerald-200/60">
              <span>METHODOLOGY: IAI &amp; ISO 14044</span>
              <span className="text-emerald-400">STATUS: AUDIT READY</span>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
