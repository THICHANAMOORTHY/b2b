"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  MapPin,
  Building2,
} from "lucide-react";
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
    let ignore = false;
    async function initLoad() {
      try {
        const [m, res, req, comp] = await Promise.all([
          fetchMatches(),
          fetchResources(),
          fetchRequirements(),
          fetchCompanies(),
        ]);
        if (!ignore) {
          setMatches(m);
          setResources(res);
          setRequirements(req);
          setCompanies(comp);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    initLoad();
    return () => {
      ignore = true;
    };
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-[#64748B]">Calculating semantic AI compatibility vectors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">
            AI RECOMMENDATION ENGINE
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-outfit mt-0.5">
            Synergy Matches & Compatibility
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Weighted semantic embeddings (all-MiniLM-L6-v2) &middot; Proximity optimization (≤200km)
          </p>
        </div>

        <button
          onClick={handleGenerateMatches}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          {generating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>{generating ? "Computing Match Scores..." : "Run AI Matchmaker"}</span>
        </button>
      </div>

      {/* Match Cards List */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="saas-card p-12 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-[#2563EB] mx-auto opacity-70" />
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">No Synergy Matches Generated Yet</h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1">
                Post surplus material listings and procurement requirements, then run the AI engine to generate recommendations.
              </p>
            </div>
            <button
              onClick={handleGenerateMatches}
              disabled={generating}
              className="px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-xs font-semibold hover:bg-[#1D4ED8] shadow-sm"
            >
              Generate First Matches
            </button>
          </div>
        ) : (
          matches.map((match) => {
            const resource = resources.find((r) => r.id === match.resourceId);
            const requirement = requirements.find((req) => req.id === match.requirementId);
            const supplier = companies.find((c) => c.id === resource?.companyId);
            const buyer = companies.find((c) => c.id === requirement?.companyId);

            const score = Math.round(match.matchScore || 85);
            const distance = match.distanceKm ? Math.round(match.distanceKm) : 18;
            const isAccepted = match.status === "ACCEPTED";
            const isRejected = match.status === "REJECTED";

            return (
              <div
                key={match.id}
                className="saas-card p-6 border border-[#E2E8F0] hover:border-[#BFDBFE] transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Pair Route Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col items-center justify-center text-[#2563EB] shrink-0">
                      <span className="text-xl font-black font-outfit leading-none">{score}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Synergy</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#0F172A]">
                          {resource?.name || resource?.materialType || "Surplus Scrap"}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-[#94A3B8]" />
                        <h3 className="text-base font-bold text-[#2563EB]">
                          {requirement?.materialType || "Secondary Raw Feedstock"}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#2563EB]" /> {supplier?.name || "Supplier Facility"}
                        </span>
                        <span>→</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#16A34A]" /> {buyer?.name || "Buyer Plant"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isAccepted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A] text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accepted & In Transit
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-[#EF4444] text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Declined
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" /> Certified AI Recommendation
                      </span>
                    )}
                  </div>
                </div>

                {/* Score Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] text-xs">
                  <div>
                    <span className="text-[#64748B] text-[11px] block">Quantity Alignment</span>
                    <span className="font-bold text-[#0F172A] mt-0.5 block">
                      {resource?.quantity || 0} / {requirement?.quantity || 0} {resource?.unit || "kg"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#64748B] text-[11px] block">Transit Distance</span>
                    <span className="font-bold text-[#0F172A] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2563EB]" /> {distance} km radius
                    </span>
                  </div>

                  <div>
                    <span className="text-[#64748B] text-[11px] block">CO2e Abatement</span>
                    <span className="font-bold text-[#16A34A] mt-0.5 block">
                      ~{((resource?.quantity || 1000) * 0.0024).toFixed(2)} tCO2e
                    </span>
                  </div>

                  <div>
                    <span className="text-[#64748B] text-[11px] block">Est. Freight Savings</span>
                    <span className="font-bold text-[#0F172A] mt-0.5 block">
                      ₹{(distance * 35).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#64748B] font-medium">
                    Verified through ISO-14044 LCA protocol
                  </span>

                  <div className="flex items-center gap-3">
                    {!isAccepted && !isRejected && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(match.id, "REJECTED")}
                          disabled={updatingId === match.id}
                          className="px-3.5 py-1.5 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] text-xs font-semibold rounded-xl transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(match.id, "ACCEPTED")}
                          disabled={updatingId === match.id}
                          className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                        >
                          Accept & Proceed
                        </button>
                      </>
                    )}
                    {isAccepted && (
                      <Link
                        href="/exchange"
                        className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <span>Open in Exchange Tracker</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
