"use client";

import { useState, useEffect } from 'react';
import { CheckCircle2, Truck, FileText, CheckSquare, MessageSquare, MapPin, Loader2, ArrowLeft, ArrowRight, ShieldCheck, Sprout, Trees } from 'lucide-react';
import Link from 'next/link';
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
} from '@/lib/api';

interface TransactionData {
  match: Match;
  resource: Resource;
  requirement: Requirement;
  supplier: Company;
  buyer: Company;
}

export default function Exchange() {
  const [data, setData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [matchesRes, resourcesRes, requirementsRes, companiesRes] = await Promise.all([
          fetchMatches(),
          fetchResources(),
          fetchRequirements(),
          fetchCompanies(),
        ]);

        const acceptedMatch: Match =
          matchesRes.find((m: Match) => m.status === 'ACCEPTED') ??
          matchesRes.find((m: Match) => m.status === 'MATCHED') ??
          matchesRes[0];

        if (!acceptedMatch) {
          setError('No matches found. Accept a match from the AI Match Center first.');
          return;
        }

        const resource = resourcesRes.find((r) => r.id === acceptedMatch.resourceId);
        const requirement = requirementsRes.find((r) => r.id === acceptedMatch.requirementId);
        const supplier = companiesRes.find((c) => c.id === resource?.companyId);
        const buyer = companiesRes.find((c) => c.id === requirement?.companyId);

        if (!resource || !requirement || !supplier || !buyer) {
          setError('Could not load transaction details.');
          return;
        }

        setData({ match: acceptedMatch, resource, requirement, supplier, buyer });
      } catch {
        setError('Could not connect to the backend. Make sure the API server is running.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleConfirm = async () => {
    if (!data) return;
    setConfirming(true);
    try {
      await updateMatchStatus(data.match.id, 'COMPLETED');
      setConfirmed(true);
    } catch {
      alert('Failed to confirm exchange. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const getStepStatus = (stepId: number) => {
    if (!data) return 'upcoming';
    const status = confirmed ? 'COMPLETED' : data.match.status;
    if (status === 'COMPLETED') return stepId <= 5 ? 'completed' : 'upcoming';
    if (status === 'ACCEPTED') return stepId <= 2 ? 'completed' : stepId === 3 ? 'current' : 'upcoming';
    return stepId === 1 ? 'completed' : stepId === 2 ? 'current' : 'upcoming';
  };

  const steps = [
    { id: 1, title: 'Bio-Synergy Matched', icon: CheckSquare },
    { id: 2, title: 'Smart Contract & Terms', icon: MessageSquare },
    { id: 3, title: 'Escrow Lock', icon: FileText },
    { id: 4, title: 'Low-Emission Freight', icon: Truck },
    { id: 5, title: 'Completed & Offset', icon: CheckCircle2 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin shadow-lg shadow-emerald-500/20" />
          <p className="text-emerald-200 font-medium font-outfit text-lg">Loading circular exchange workflow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="agri-glass rounded-3xl p-8 text-center max-w-md space-y-4 border border-emerald-500/20">
          <p className="text-slate-300 font-sans text-sm">{error}</p>
          <Link href="/matches" className="agri-btn-primary text-xs py-2 px-4">
            <ArrowLeft className="w-4 h-4" /> Go to AI Match Center
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const transportCost = Math.round(data.match.distanceKm * 8);
  const totalValue = Math.round(data.resource.quantity * data.resource.price);
  const pickupDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/matches" className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-outfit">
              Exchange & Bio-Logistics Hub
            </h1>
          </div>
          <p className="text-slate-300 text-sm font-sans pl-11">
            {data.resource.name} • {data.resource.quantity} {data.resource.unit} •{' '}
            <span className={`font-bold ${confirmed ? 'text-emerald-400' : data.match.status === 'ACCEPTED' ? 'text-[#f59e0b]' : 'text-teal-300'}`}>
              {confirmed ? 'Completed' : data.match.status}
            </span>
          </p>
        </div>
      </div>

      {/* Stepper with Delisas glow nodes */}
      <div className="agri-card p-6 sm:p-8 relative overflow-hidden border border-emerald-500/20">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10 w-full">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg transition-all duration-300 ${
                  status === 'completed' ? 'bg-emerald-500 text-white shadow-emerald-500/30' :
                  status === 'current'   ? 'bg-[#f59e0b] text-white shadow-[#f59e0b]/40 ring-4 ring-[#f59e0b]/20' :
                  'bg-white/[0.06] border border-emerald-500/20 text-slate-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-bold text-center leading-tight ${
                  status === 'completed' ? 'text-emerald-300' :
                  status === 'current'   ? 'text-[#fcd34d]' :
                  'text-slate-400'
                }`}>{step.title}</span>

                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-[50%] w-full h-[2px] -z-10 transition-colors ${
                    status === 'completed' ? 'bg-emerald-500' : 'bg-emerald-500/20'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Bento Grid */}
      <div className="agri-card overflow-hidden flex flex-col md:flex-row border border-emerald-500/20">
        
        {/* Left Side Details */}
        <div className="bg-gradient-to-b from-[#0e271a] to-[#071910] p-6 sm:p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-emerald-500/20 space-y-6">
          <h3 className="font-extrabold text-white font-outfit text-base">Exchange Manifest</h3>
          
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-emerald-400 font-bold uppercase tracking-wider mb-1">Producer / Farm Node</p>
              <p className="font-bold text-white text-sm">{data.supplier.name}</p>
              <p className="text-slate-300 mt-0.5">{data.supplier.location}</p>
            </div>
            <div>
              <p className="text-emerald-400 font-bold uppercase tracking-wider mb-1">Offtaker / Bio-Plant</p>
              <p className="font-bold text-white text-sm">{data.buyer.name}</p>
              <p className="text-slate-300 mt-0.5">{data.buyer.location}</p>
            </div>
            <div>
              <p className="text-emerald-400 font-bold uppercase tracking-wider mb-1">Feedstock Material</p>
              <p className="font-bold text-white text-sm">{data.resource.name}</p>
              <p className="text-slate-300 mt-0.5">{data.resource.quantity} {data.resource.unit} • {data.resource.quality}</p>
            </div>
            <div>
              <p className="text-emerald-400 font-bold uppercase tracking-wider mb-1">Settlement</p>
              {data.resource.price === 0
                ? <p className="font-black text-xl text-emerald-400 font-outfit">Free Circular Stream</p>
                : <p className="font-black text-xl text-emerald-400 font-outfit">₹{totalValue.toLocaleString('en-IN')}</p>
              }
            </div>
          </div>
        </div>

        {/* Right Action Container */}
        <div className="p-6 sm:p-8 md:w-2/3 flex flex-col justify-between">
          {confirmed ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white font-outfit">Bio-Circularity Loop Activated!</h2>
              <p className="text-slate-300 text-xs sm:text-sm font-sans max-w-sm">
                Smart contract ratified and EV freight scheduled. Sustainability indicators have refreshed on the Soil & Impact dashboard.
              </p>
              <Link
                href="/impact"
                className="agri-btn-primary text-xs py-2.5 px-6 mt-2"
              >
                <span>View Soil & Carbon Impact</span>
                <span className="agri-arrow-circle">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-outfit">Smart Logistics Escrow</h2>
                  <p className="text-xs text-slate-300">Review logistics routing and sign automated bioeconomy smart contract</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/15 space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-200">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Origin Farm / Facility
                  </span>
                  <span className="font-bold text-white">{data.resource.location} • {pickupDate}</span>
                </div>
                <div className="flex justify-between items-center text-slate-200 border-t border-emerald-500/10 pt-2.5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" /> Receiving Bio-Facility
                  </span>
                  <span className="font-bold text-white">{data.requirement.location} • {pickupDate}</span>
                </div>
                <div className="flex justify-between items-center text-slate-200 border-t border-emerald-500/10 pt-2.5">
                  <span className="text-slate-400">Transit Distance</span>
                  <span className="font-bold text-white">{data.match.distanceKm} km</span>
                </div>
                <div className="flex justify-between items-center text-slate-200 border-t border-emerald-500/10 pt-2.5">
                  <span className="text-slate-400">Estimated Transport Cost</span>
                  <span className="font-bold text-white">₹{transportCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <Link
                  href="/matches"
                  className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition-all border border-emerald-500/20"
                >
                  Back to Matches
                </Link>
                <button
                  id="btn-sign-confirm"
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="agri-btn-primary text-xs py-2.5"
                >
                  {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                  <span>{confirming ? 'Ratifying...' : 'Sign Agreement & Schedule Freight'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
