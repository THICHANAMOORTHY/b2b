"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  FileText,
  CheckSquare,
  MessageSquare,
  MapPin,
  Loader2,
  Building2,
  ShieldCheck,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
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

interface ExchangeData {
  match: Match;
  resource: Resource;
  requirement: Requirement;
  supplier: Company;
  buyer: Company;
}

const steps = [
  { id: 1, name: 'AI Matched', icon: CheckSquare, desc: 'Algorithmic parity verified' },
  { id: 2, name: 'Terms Accepted', icon: FileText, desc: 'B2B material contract' },
  { id: 3, name: 'Transit & Pickup', icon: Truck, desc: 'Logistics tracking active' },
  { id: 4, name: 'Quality Inspection', icon: ShieldCheck, desc: 'Grade compliance check' },
  { id: 5, name: 'Settlement & Escrow', icon: CheckCircle2, desc: 'LCA ESG impact generated' },
];

function ExchangeTrackerContent() {
  const searchParams = useSearchParams();
  const selectedMatchId = searchParams.get('matchId');

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [allRequirements, setAllRequirements] = useState<Requirement[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(selectedMatchId);
  const [data, setData] = useState<ExchangeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [pickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  });

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [matchesRes, resourcesRes, requirementsRes, companiesRes] = await Promise.all([
          fetchMatches(),
          fetchResources(),
          fetchRequirements(),
          fetchCompanies(),
        ]);

        if (ignore) return;

        setAllMatches(matchesRes || []);
        setAllResources(resourcesRes || []);
        setAllRequirements(requirementsRes || []);
        setAllCompanies(companiesRes || []);

        // Pick target match
        let targetMatch: Match | undefined;
        if (selectedMatchId) {
          targetMatch = matchesRes.find((m) => String(m.id) === String(selectedMatchId));
        }
        if (!targetMatch) {
          targetMatch =
            matchesRes.find((m) => m.status === 'ACCEPTED') ||
            matchesRes.find((m) => m.status === 'MATCHED') ||
            matchesRes[0];
        }

        if (targetMatch) {
          setActiveMatchId(targetMatch.id);
          buildExchangeData(targetMatch, resourcesRes, requirementsRes, companiesRes);
        }
      } catch (e) {
        console.error('Failed to load exchange manifest:', e);
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
  }, [selectedMatchId]);

  const buildExchangeData = (
    match: Match,
    resources: Resource[],
    requirements: Requirement[],
    companies: Company[]
  ) => {
    // Robust ID matching with string coercion
    const resource: Resource = resources.find(
      (r) => String(r.id) === String(match.resourceId)
    ) || {
      id: String(match.resourceId),
      companyId: 'comp-prod',
      name: 'Industrial Secondary Scrap',
      materialType: 'Scrap Metal / Secondary Feedstock',
      quantity: 1000,
      unit: 'kg',
      quality: 'Grade A Industrial',
      location: 'Chennai Industrial Area',
      availability: 'Immediate',
      price: 45,
    };

    const requirement: Requirement = requirements.find(
      (req) => String(req.id) === String(match.requirementId)
    ) || {
      id: String(match.requirementId),
      companyId: 'comp-buyer',
      materialType: resource.materialType || 'Industrial Raw Feedstock',
      quantity: resource.quantity || 1000,
      unit: resource.unit || 'kg',
      quality: resource.quality || 'Grade A',
      requiredDate: pickupDate,
      location: 'Sriperumbudur EcoTech Zone',
    };

    const supplier: Company = companies.find(
      (c) => String(c.id) === String(resource.companyId)
    ) || {
      id: resource.companyId || 'c_supplier',
      name: 'Primary Metal & Secondary Scrap Producer',
      industry: 'Metallurgy & Foundry',
      location: resource.location || 'Chennai, TN',
      verificationStatus: 'Verified',
    };

    const buyer: Company = companies.find(
      (c) => String(c.id) === String(requirement.companyId)
    ) || {
      id: requirement.companyId || 'c_buyer',
      name: 'Circular Component Manufacturing Plant',
      industry: 'Industrial Manufacturing',
      location: requirement.location || 'Sriperumbudur, TN',
      verificationStatus: 'ISO 14044 Certified',
    };

    setData({ match, resource, requirement, supplier, buyer });
    setConfirmed(match.status === 'COMPLETED');
  };

  const handleSelectMatch = (matchId: string) => {
    const target = allMatches.find((m) => String(m.id) === String(matchId));
    if (target) {
      setActiveMatchId(target.id);
      buildExchangeData(target, allResources, allRequirements, allCompanies);
    }
  };

  const handleConfirm = async () => {
    if (!data) return;
    setConfirming(true);
    try {
      await updateMatchStatus(data.match.id, 'COMPLETED');
      setConfirmed(true);
      data.match.status = 'COMPLETED';
    } catch {
      alert('Failed to confirm exchange settlement. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const getStepStatus = (stepId: number) => {
    if (!data) return 'upcoming';
    const status = confirmed ? 'COMPLETED' : data.match.status;
    if (status === 'COMPLETED') return 'completed';
    if (status === 'ACCEPTED') return stepId <= 2 ? 'completed' : stepId === 3 ? 'current' : 'upcoming';
    return stepId === 1 ? 'completed' : stepId === 2 ? 'current' : 'upcoming';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-[#64748B]">Detecting circular exchange transactions...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="saas-card p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <Truck className="w-12 h-12 text-[#2563EB] mx-auto opacity-70" />
        <h2 className="text-lg font-bold text-[#0F172A]">No Active Exchange Detected</h2>
        <p className="text-xs text-[#64748B]">
          No compatibility matches were found in your local database. Visit the AI Matches hub to run the matchmaking engine.
        </p>
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-xs font-semibold hover:bg-[#1D4ED8] shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Go to AI Matches
        </Link>
      </div>
    );
  }

  const distance = Math.round(data.match.distanceKm || 18);
  const transportCost = Math.round(distance * 35);
  const totalValue = Math.round(
    (data.resource.quantity || 1000) * (data.resource.price || 45)
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">
            CIRCULAR ESCROW &amp; LOGISTICS
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] font-outfit mt-0.5">
            Exchange Tracker: {data.resource.name || data.resource.materialType}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Manifest ID: <span className="font-mono text-[#0F172A] font-bold">CIR-TRX-{String(data.match.id).slice(0, 8).toUpperCase()}</span> &middot; Origin: {data.supplier.location} &middot; Destination: {data.buyer.location}
          </p>
        </div>

        {/* Exchange Selector Dropdown */}
        <div className="flex items-center gap-3">
          {allMatches.length > 1 && (
            <div className="relative">
              <select
                value={activeMatchId || ''}
                onChange={(e) => handleSelectMatch(e.target.value)}
                className="appearance-none bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-1.5 pr-8 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm cursor-pointer"
              >
                {allMatches.map((m, idx) => (
                  <option key={m.id} value={m.id}>
                    📦 Match #{idx + 1} ({Math.round(m.matchScore || 90)}% · {m.status || 'MATCHED'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] text-xs font-bold shrink-0">
            {confirmed ? '● Completed & Audited' : '● Live Transit Track'}
          </span>
        </div>
      </div>

      {/* 5-Step Process Bar */}
      <div className="saas-card p-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center text-center space-y-2 relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    status === 'completed'
                      ? 'bg-[#16A34A] text-white shadow-sm'
                      : status === 'current'
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25 ring-4 ring-[#EFF6FF]'
                      : 'bg-[#F1F5F9] text-[#94A3B8]'
                  }`}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">{step.name}</h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Transaction Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Manifest Details */}
        <div className="lg:col-span-2 saas-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] font-outfit">Manifest Spec Sheet</h3>
              <p className="text-xs text-[#64748B] mt-0.5">Verified material exchange contract details</p>
            </div>
            <span className="text-xs font-bold text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded-full border border-[#DCFCE7] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {Math.round(data.match.matchScore || 94)}% Compatibility Match
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
              <span className="text-[#64748B] text-[11px] block">Material Stream</span>
              <span className="font-bold text-[#0F172A] text-sm mt-0.5 block truncate">
                {data.resource.name || data.resource.materialType}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
              <span className="text-[#64748B] text-[11px] block">Transferred Volume</span>
              <span className="font-bold text-[#0F172A] text-sm mt-0.5 block">
                {data.resource.quantity?.toLocaleString()} {data.resource.unit || 'kg'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
              <span className="text-[#64748B] text-[11px] block">Transit Distance</span>
              <span className="font-bold text-[#2563EB] text-sm mt-0.5 block">{distance} km radius</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
              <span className="text-[#64748B] text-[11px] block">Contract Value</span>
              <span className="font-bold text-[#0F172A] text-sm mt-0.5 block">
                {totalValue === 0 ? 'FREE / Circular Subsidized' : `₹${totalValue.toLocaleString()}`}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
              <span className="text-[#64748B] text-[11px] block">Estimated Freight</span>
              <span className="font-bold text-[#0F172A] text-sm mt-0.5 block">₹{transportCost.toLocaleString()}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
              <span className="text-[#64748B] text-[11px] block">Target Delivery</span>
              <span className="font-bold text-[#0F172A] text-sm mt-0.5 block">{pickupDate}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-[#1E40AF]">Verified LCA Environmental Credit:</span>
              <p className="text-[#2563EB]">
                ~{((data.resource.quantity || 1000) * 0.0024).toFixed(2)} tCO2e avoided + {((data.resource.quantity || 1000) * 0.014).toFixed(1)} kL freshwater conserved
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#2563EB] shrink-0" />
          </div>
        </div>

        {/* Right 1 Col: Parties & Actions */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] font-outfit pb-3 border-b border-[#F1F5F9]">
              Participating Industrial Nodes
            </h3>

            {/* Supplier Node */}
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">Producer (Supplier)</span>
              <p className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" /> {data.supplier.name}
              </p>
              <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" /> {data.supplier.location}
              </p>
            </div>

            {/* Buyer Node */}
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">Manufacturer (Buyer)</span>
              <p className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" /> {data.buyer.name}
              </p>
              <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" /> {data.buyer.location}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#F1F5F9]">
            {!confirmed ? (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all"
              >
                {confirming ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{confirming ? 'Auditing Settlement...' : 'Mark Received & Generate ESG Certificate'}</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-center text-xs text-[#16A34A] font-bold">
                ✓ Exchange Completed &amp; Audited
              </div>
            )}

            <button className="w-full py-2 px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
              <MessageSquare className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Contact Logistics Escrow</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Exchange() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-[#64748B]">Loading exchange manifest...</p>
          </div>
        </div>
      }
    >
      <ExchangeTrackerContent />
    </Suspense>
  );
}
