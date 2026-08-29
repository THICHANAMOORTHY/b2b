"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Plus,
  MapPin,
  Trash2,
  Loader2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
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
  const { activeCompany } = useCompany();

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

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [resData, reqData, matchData] = await Promise.all([
          fetchResources(),
          fetchRequirements(),
          fetchMatches(),
        ]);
        if (!ignore) {
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
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [activeCompany]);

  const handleModalClose = async () => {
    setShowAddResource(false);
    setShowPostReq(false);
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
    } catch {}
  };

  const handleDeleteResource = async (e: React.MouseEvent, resId: string, resName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove "${resName}"?`)) return;

    setDeletingId(resId);
    try {
      await deleteResource(resId);
      setResources((prev) => prev.filter((r) => r.id !== resId));
      setAllResources((prev) => prev.filter((r) => r.id !== resId));
    } catch {
      alert("Failed to delete resource. Please try again.");
    } finally {
      setDeletingId(null);
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
    }
  };

  const filteredResources = resources.filter((r) =>
    (r.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.materialType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequirements = requirements.filter((req) =>
    (req.materialType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topMatch = allMatches.length > 0
    ? [...allMatches].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))[0]
    : null;

  const topMatchResource = topMatch
    ? allResources.find((r) => r.id === topMatch.resourceId)
    : null;

  const topMatchRequirement = topMatch
    ? allRequirements.find((req) => req.id === topMatch.requirementId)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-[#64748B]">Loading industrial node metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {showAddResource && activeCompany && (
        <AddResourceModal companyId={activeCompany.id} onClose={handleModalClose} />
      )}
      {showPostReq && activeCompany && (
        <PostRequirementModal companyId={activeCompany.id} onClose={handleModalClose} />
      )}

      {/* ─── 1. DASHBOARD HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">
            OPERATIONS DESK
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-outfit mt-0.5">
            {activeCompany?.name || "Industrial Node"}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            {activeCompany?.industry || "Manufacturing"} &middot; {activeCompany?.location || "Chennai, TN"} &middot; Active Facility
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddResource(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>List Surplus Material</span>
          </button>

          <button
            onClick={() => setShowPostReq(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Search className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Post Sourcing Demand</span>
          </button>
        </div>
      </div>

      {/* ─── 2. 4 TOP KPI CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5">
          <p className="text-xs font-semibold text-[#64748B]">Active Listings</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0F172A] font-outfit">
              {resources.length.toString().padStart(2, "0")}
            </span>
            <span className="text-xs text-[#16A34A] font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +2
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">
            {allResources.length} total in network
          </p>
        </div>

        <div className="saas-card p-5">
          <p className="text-xs font-semibold text-[#64748B]">Sourcing Demands</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0F172A] font-outfit">
              {requirements.length.toString().padStart(2, "0")}
            </span>
            <span className="text-xs text-[#2563EB] font-semibold">Active</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">
            {allRequirements.length} across market
          </p>
        </div>

        <div className="saas-card p-5">
          <p className="text-xs font-semibold text-[#64748B]">AI Matches</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#2563EB] font-outfit">
              {allMatches.length.toString().padStart(2, "0")}
            </span>
            <span className="text-xs font-semibold text-[#16A34A] flex items-center">
              94% avg
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">
            Algorithmic synergy
          </p>
        </div>

        <div className="saas-card p-5">
          <p className="text-xs font-semibold text-[#64748B]">Avoided Carbon</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#0F172A] font-outfit">18.4</span>
            <span className="text-xs font-bold text-[#64748B]">tCO2e</span>
          </div>
          <p className="text-[11px] text-[#16A34A] mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ISO 14044 certified
          </p>
        </div>
      </div>

      {/* ─── 3. TWO COLUMN WORKSPACE ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Manifest Table */}
        <div className="lg:col-span-2 saas-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("resources")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "resources"
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Surplus Material Listings ({resources.length})
              </button>
              <button
                onClick={() => setActiveTab("requirements")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "requirements"
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Procurement Demands ({requirements.length})
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Filter materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] w-48"
              />
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* TAB 1: RESOURCES */}
          {activeTab === "resources" && (
            <div className="space-y-2.5">
              {filteredResources.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#E2E8F0] rounded-xl space-y-2">
                  <Package className="w-8 h-8 text-[#94A3B8] mx-auto" />
                  <p className="text-xs font-semibold text-[#64748B]">No surplus listings for this organization.</p>
                  <button
                    onClick={() => setShowAddResource(true)}
                    className="px-3.5 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8]"
                  >
                    + Add New Listing
                  </button>
                </div>
              ) : (
                filteredResources.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] bg-white flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0F172A] truncate">
                          {res.name || res.materialType}
                        </span>
                        {res.quality && (
                          <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] text-[10px] font-semibold">
                            {res.quality}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#64748B] mt-1 flex items-center gap-3">
                        <span className="font-semibold text-[#0F172A]">
                          {res.quantity?.toLocaleString()} {res.unit || "kg"}
                        </span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#2563EB]" />
                          {res.location || "Chennai"}
                        </span>
                        <span>&middot;</span>
                        <span className="text-[#16A34A] font-medium">
                          {res.availability || "Immediate"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-black text-[#0F172A] font-outfit">
                          {res.price === 0 ? "FREE" : `₹${res.price}/${res.unit || "kg"}`}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteResource(e, res.id, res.name || res.materialType)}
                        disabled={deletingId === res.id}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                        title="Delete listing"
                      >
                        {deletingId === res.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: REQUIREMENTS */}
          {activeTab === "requirements" && (
            <div className="space-y-2.5">
              {filteredRequirements.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#E2E8F0] rounded-xl space-y-2">
                  <Search className="w-8 h-8 text-[#94A3B8] mx-auto" />
                  <p className="text-xs font-semibold text-[#64748B]">No active sourcing demands posted.</p>
                  <button
                    onClick={() => setShowPostReq(true)}
                    className="px-3.5 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8]"
                  >
                    + Post Sourcing Demand
                  </button>
                </div>
              ) : (
                filteredRequirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] bg-white flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0F172A] truncate">
                          Need: {req.materialType}
                        </span>
                        {req.quality && (
                          <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] text-[10px] font-semibold">
                            Grade {req.quality}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#64748B] mt-1 flex items-center gap-3">
                        <span className="font-semibold text-[#0F172A]">
                          {req.quantity?.toLocaleString()} {req.unit || "kg"}
                        </span>
                        <span>&middot;</span>
                        <span>Due: {req.requiredDate || "Immediate"}</span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#2563EB]" />
                          {req.location || "Chennai"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[11px] font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Matching Active
                      </span>

                      <button
                        onClick={(e) => handleDeleteRequirement(e, req.id, req.materialType)}
                        disabled={deletingId === req.id}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                        title="Delete demand"
                      >
                        {deletingId === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Top AI Synergy Match */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-bold text-sm text-[#0F172A] font-outfit">
                  Top Synergy Match
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB]">
                AI Verified
              </span>
            </div>

            {topMatch ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A]">
                      {topMatchResource?.name || topMatchResource?.materialType || "Copper Scrap"}
                    </h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Target: {topMatchRequirement?.quantity || 800} kg &middot; {topMatch.distanceKm ? Math.round(topMatch.distanceKm) : 18} km away
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col items-center justify-center text-[#2563EB] shrink-0">
                    <span className="text-sm font-black font-outfit">
                      {Math.round(topMatch.matchScore || 94)}%
                    </span>
                    <span className="text-[8px] font-bold uppercase">Match</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Material Affinity:</span>
                    <span className="font-bold text-[#0F172A]">98%</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Transit Proximity:</span>
                    <span className="font-bold text-[#0F172A]">92%</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>CO2e Avoidance:</span>
                    <span className="font-bold text-[#16A34A]">2.48 tCO2e</span>
                  </div>
                </div>

                <Link
                  href="/matches"
                  className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all block text-center"
                >
                  <span>Review All Matches</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <Sparkles className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <p className="text-xs text-[#64748B]">Generating AI synergies...</p>
                <Link
                  href="/matches"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline"
                >
                  <span>Go to Matches Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#64748B]">
            <span>Algorithm: all-MiniLM-L6-v2</span>
            <span className="text-[#16A34A] font-semibold">● Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
