"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, ArrowRight, Zap, Target, Scale, Clock, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Match {
  id: string;
  resourceId: string;
  requirementId: string;
  matchScore: number;
  distanceKm: number;
  status: string;
}
interface Resource {
  id: string;
  name: string;
  companyId: string;
  quantity: number;
  unit: string;
}
interface Requirement {
  id: string;
  materialType: string;
  quantity: number;
  unit: string;
}
interface Company {
  id: string;
  name: string;
}

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
        fetch("http://localhost:8000/api/matches").then((r) => r.json()),
        fetch("http://localhost:8000/api/resources").then((r) => r.json()),
        fetch("http://localhost:8000/api/requirements").then((r) => r.json()),
        fetch("http://localhost:8000/api/companies").then((r) => r.json()),
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
      await fetch("http://localhost:8000/api/generate-matches", { method: "POST" });
      await fetchAll();
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (matchId: string, status: string) => {
    setUpdatingId(matchId);
    try {
      await fetch(`http://localhost:8000/api/matches/${matchId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchAll();
    } finally {
      setUpdatingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "from-green-600 to-emerald-700";
    if (score >= 75) return "from-indigo-600 to-purple-700";
    return "from-slate-700 to-slate-900";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MATCHED":
        return <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">Pending Review</span>;
      case "ACCEPTED":
        return <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Accepted</span>;
      case "REJECTED":
        return <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" />Rejected</span>;
      case "COMPLETED":
        return <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Completed</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 font-medium">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-2">
          <Sparkles className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Match Center</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Our recommendation engine has analyzed your requirements and identified the best circular matches based on material compatibility, proximity, and quantity.
        </p>
        <button
          id="btn-generate-matches"
          onClick={handleGenerateMatches}
          disabled={generating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {generating ? "Scanning Network..." : "Re-run AI Engine"}
        </button>
      </div>

      <div className="space-y-8">
        {matches.map((match) => {
          const resource = resources.find((r) => r.id === match.resourceId);
          const requirement = requirements.find((r) => r.id === match.requirementId);
          const supplier = companies.find((c) => c.id === resource?.companyId);

          if (!resource || !requirement || !supplier) return null;

          const isUpdating = updatingId === match.id;
          const qty_pct = Math.min(100, Math.round((resource.quantity / requirement.quantity) * 100));

          return (
            <div
              key={match.id}
              className="bg-white rounded-2xl border shadow-lg overflow-hidden flex flex-col md:flex-row relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-0 pointer-events-none" />

              {/* Left: Score panel */}
              <div
                className={`bg-gradient-to-br ${getScoreColor(match.matchScore)} text-white p-8 md:w-1/3 flex flex-col justify-center items-center text-center relative overflow-hidden shrink-0`}
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 space-y-3">
                  <div className="text-xs font-semibold text-white/70 tracking-widest uppercase">Match Confidence</div>
                  <div className="text-6xl font-black">{match.matchScore}%</div>
                  <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-sm font-medium">
                    <Target className="w-4 h-4 text-green-300" />
                    {match.matchScore >= 85 ? "Highly Recommended" : "Good Match"}
                  </div>
                  <div className="pt-2">{getStatusBadge(match.status)}</div>
                </div>
              </div>

              {/* Right: Details */}
              <div className="p-8 md:w-2/3 flex flex-col relative z-10">
                <div className="flex justify-between items-start mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                      {resource.name}
                      <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded">
                        SUPPLY
                      </span>
                    </h2>
                    <p className="text-slate-500 mt-1">
                      Offered by <span className="font-medium text-slate-700">{supplier.name}</span>
                    </p>
                  </div>
                  {match.status === "MATCHED" && (
                    <Link
                      href="/exchange"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2 shrink-0 text-sm"
                    >
                      Start Exchange <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Scale className="w-4 h-4" />
                      <span className="text-sm font-medium">Quantity Coverage</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {resource.quantity} {resource.unit}{" "}
                      <span className="text-sm font-normal text-slate-500">available</span>
                    </p>
                    {/* Mini progress bar */}
                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${qty_pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-green-600 mt-1">Covers {qty_pct}% of your requirement</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Logistics</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {match.distanceKm} km{" "}
                      <span className="text-sm font-normal text-slate-500">away</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Est. transport: ₹{Math.round(match.distanceKm * 8).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="pt-4 border-t border-slate-100 mb-6">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">AI Analysis Factors</h4>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Material Compat. (40%)
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Proximity (25%)
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Quantity (20%)
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                      <Clock className="w-4 h-4 text-blue-400" /> Quality + Timing (15%)
                    </div>
                  </div>
                </div>

                {/* Accept / Reject */}
                {match.status === "MATCHED" && (
                  <div className="flex gap-3 mt-auto">
                    <button
                      id={`btn-accept-${match.id}`}
                      onClick={() => handleUpdateStatus(match.id, "ACCEPTED")}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Accept Match
                    </button>
                    <button
                      id={`btn-reject-${match.id}`}
                      onClick={() => handleUpdateStatus(match.id, "REJECTED")}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-60"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
                {match.status === "ACCEPTED" && (
                  <Link
                    href="/exchange"
                    className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Proceed to Exchange <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {matches.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No AI matches found yet.</p>
            <p className="text-slate-400 text-sm mt-1">Post a requirement or click "Re-run AI Engine" above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
