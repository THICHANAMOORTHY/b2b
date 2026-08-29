"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, ArrowRight, Zap, Target, Scale, Clock, CheckCircle2, XCircle, Loader2, RefreshCw, Sprout, Wheat, Trees } from "lucide-react";
import Link from "next/link";
import {
  Match,
  Resource,
  Requirement,
  Company,
  fetchMatches,
  fetchResources,
  fetchRequirements,
  fetchCompanies,
  updateMatchStatus,
  generateMatches,
} from "@/lib/api";

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [m, res, req, comp] = await Promise.all([
        fetchMatches(),
        fetchResources(),
        fetchRequirements(),
        fetchCompanies(),
      ]);
      setMatches(m);
      setResources(res);
      setRequirements(req);
      setCompanies(comp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleGenerateMatches = async () => {
    setGenerating(true);
    try {
      await generateMatches();
      await fetchAll();
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (matchId: string, status: string) => {
    setUpdatingId(matchId);
    try {
      await updateMatchStatus(matchId, status);
      await fetchAll();
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MATCHED":
        return <span className="text-xs font-bold px-3 py-1 bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/30 rounded-full">Pending Review</span>;
      case "ACCEPTED":
        return <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Synergy Accepted</span>;
      case "REJECTED":
        return <span className="text-xs font-bold px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Declined</span>;
      case "COMPLETED":
        return <span className="text-xs font-bold px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Loop Closed</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin shadow-lg shadow-emerald-500/20" />
          <p className="text-emerald-200 font-medium font-outfit text-lg">Scanning neural bioeconomy circularity vectors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-bold animate-agri-float">
          <Sprout className="w-3.5 h-3.5" />
          <span>Regenerative AI Match Center</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-outfit">
          AI Bio & Byproduct Synergies
        </h1>
        <p className="text-slate-300 text-sm sm:text-base font-sans leading-relaxed">
          Deep learning evaluates chemistry, carbon offset potential, and hauling distances to orchestrate seamless zero-waste circular loops.
        </p>
        <div className="pt-2">
          <button
            id="btn-generate-matches"
            onClick={handleGenerateMatches}
            disabled={generating}
            className="agri-btn-primary"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{generating ? "Computing Neural Vectors..." : "Re-run Agritech AI Engine"}</span>
            <span className="agri-arrow-circle">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {matches.map((match) => {
          const resource = resources.find((r) => r.id === match.resourceId);
          const requirement = requirements.find((r) => r.id === match.requirementId);
          const supplier = companies.find((c) => c.id === resource?.companyId);
          const supplierName = supplier?.name ?? "Agri Partner";

          if (!resource || !requirement) return null;

          const isUpdating = updatingId === match.id;
          const qty_pct = requirement.quantity ? Math.min(100, Math.round((resource.quantity / requirement.quantity) * 100)) : 100;

          return (
            <div
              key={match.id}
              className="agri-card overflow-hidden flex flex-col md:flex-row group border border-emerald-500/20 relative"
            >
              {/* Left Score Bento Column */}
              <div className="bg-gradient-to-b from-[#0e271a] to-[#071910] p-8 md:w-1/3 flex flex-col justify-center items-center text-center relative border-b md:border-b-0 md:border-r border-emerald-500/20 shrink-0">
                <div className="space-y-3 z-10">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    Synergy Confidence
                  </span>
                  <div className="text-6xl font-black text-white font-outfit tracking-tighter">
                    {match.matchScore}<span className="text-emerald-400 text-4xl">%</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-emerald-500/20 text-xs font-semibold text-emerald-200">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    {match.matchScore >= 85 ? "Optimal Bio-Parity" : "Compatible Stream"}
                  </div>
                  <div className="pt-2">{getStatusBadge(match.status)}</div>
                </div>
              </div>

              {/* Right Match Analysis Details */}
              <div className="p-6 sm:p-8 md:w-2/3 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-white font-outfit">
                          {resource.name}
                        </h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          SUPPLY
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Supplied by <span className="font-bold text-white">{supplierName}</span>
                      </p>
                    </div>

                    {match.status === "MATCHED" && (
                      <Link
                        href="/exchange"
                        className="agri-btn-secondary text-xs py-2 px-4"
                      >
                        <span>Start Exchange</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                      </Link>
                    )}
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/15">
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5 font-medium text-slate-400">
                          <Scale className="w-3.5 h-3.5 text-emerald-400" /> Volume Match
                        </span>
                        <span className="font-bold text-emerald-300">{qty_pct}%</span>
                      </div>
                      <p className="text-base font-bold text-white font-outfit">
                        {resource.quantity} {resource.unit}
                      </p>
                      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${qty_pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/15">
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5 font-medium text-slate-400">
                          <Zap className="w-3.5 h-3.5 text-[#f59e0b]" /> Haul Distance
                        </span>
                        <span className="text-[11px] text-slate-400">Transit Radius</span>
                      </div>
                      <p className="text-base font-bold text-white font-outfit">
                        {match.distanceKm} km
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Low emission transport: <strong className="text-emerald-300">₹{Math.round(match.distanceKm * 8).toLocaleString("en-IN")}</strong>
                      </p>
                    </div>
                  </div>

                  {/* AI Factor Tags */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-500/15">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-200 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Bio-Compatibility 40%
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-200 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Farm Proximity 25%
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-200 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Quantity Parity 20%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {match.status === "MATCHED" && (
                  <div className="flex flex-wrap gap-3 pt-4">
                    <button
                      id={`btn-accept-${match.id}`}
                      onClick={() => handleUpdateStatus(match.id, "ACCEPTED")}
                      disabled={isUpdating}
                      className="flex-1 py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Accept Synergy Match
                    </button>
                    <button
                      id={`btn-reject-${match.id}`}
                      onClick={() => handleUpdateStatus(match.id, "REJECTED")}
                      disabled={isUpdating}
                      className="py-2.5 px-5 rounded-full bg-white/[0.04] hover:bg-red-500/15 border border-emerald-500/20 hover:border-red-500/30 text-slate-300 hover:text-red-400 font-bold text-xs transition-all"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {match.status === "ACCEPTED" && (
                  <Link
                    href="/exchange"
                    className="agri-btn-primary w-full text-xs py-2.5"
                  >
                    <span>Proceed to Smart Escrow & Freight Dispatch</span>
                    <span className="agri-arrow-circle">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {matches.length === 0 && (
          <div className="text-center py-20 agri-glass rounded-3xl border border-dashed border-emerald-500/30 space-y-3">
            <Sprout className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-white font-bold font-outfit text-lg">No active matches found</p>
            <p className="text-slate-300 text-xs max-w-sm mx-auto">
              Post an agricultural byproduct or requirement, or click &quot;Re-run Agritech AI Engine&quot; above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
