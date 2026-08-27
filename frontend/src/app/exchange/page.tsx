"use client";

import { useState, useEffect } from 'react';
import { CheckCircle2, Truck, FileText, CheckSquare, MessageSquare, MapPin, Loader2, ArrowLeft } from 'lucide-react';
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

        // Find the most recent accepted (or any) match to show in exchange view
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

  // Derive step state from match status
  const getStepStatus = (stepId: number) => {
    if (!data) return 'upcoming';
    const status = confirmed ? 'COMPLETED' : data.match.status;
    if (status === 'COMPLETED') return stepId <= 5 ? 'completed' : 'upcoming';
    if (status === 'ACCEPTED') return stepId <= 2 ? 'completed' : stepId === 3 ? 'current' : 'upcoming';
    // MATCHED
    return stepId === 1 ? 'completed' : stepId === 2 ? 'current' : 'upcoming';
  };

  const steps = [
    { id: 1, title: 'Match Found',       icon: CheckSquare },
    { id: 2, title: 'Negotiation',       icon: MessageSquare },
    { id: 3, title: 'Agreement Signed',  icon: FileText },
    { id: 4, title: 'In Transit',        icon: Truck },
    { id: 5, title: 'Completed',         icon: CheckCircle2 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 font-medium">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center max-w-md">
          <p className="text-amber-800 font-medium">{error}</p>
          <Link href="/matches" className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:underline">
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/matches" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exchange Workflow</h1>
          </div>
          <p className="text-slate-500 ml-7">
            {data.resource.name} • {data.resource.quantity} {data.resource.unit} •{' '}
            <span className={`font-medium ${confirmed ? 'text-green-600' : data.match.status === 'ACCEPTED' ? 'text-amber-600' : 'text-indigo-600'}`}>
              {confirmed ? 'Completed' : data.match.status}
            </span>
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white p-8 rounded-2xl border shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10 w-full">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm border-2 transition-all ${
                  status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                  status === 'current'   ? 'bg-white border-amber-500 text-amber-500 ring-4 ring-amber-100' :
                  'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${
                  status === 'completed' ? 'text-green-700' :
                  status === 'current'   ? 'text-amber-700' :
                  'text-slate-400'
                }`}>{step.title}</span>

                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-[50%] w-full h-[2px] -z-10 transition-colors ${
                    status === 'completed' ? 'bg-green-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction card */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left: Details */}
        <div className="bg-slate-50 p-6 md:w-1/3 border-r space-y-5">
          <h3 className="font-semibold text-slate-900">Transaction Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Supplier</p>
              <p className="font-medium text-slate-900">{data.supplier.name}</p>
              <p className="text-xs text-slate-400">{data.supplier.location}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Buyer</p>
              <p className="font-medium text-slate-900">{data.buyer.name}</p>
              <p className="text-xs text-slate-400">{data.buyer.location}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Material</p>
              <p className="font-medium text-slate-900">{data.resource.name}</p>
              <p className="text-xs text-slate-400">{data.resource.quantity} {data.resource.unit} • {data.resource.quality}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Deal Value</p>
              {data.resource.price === 0
                ? <p className="font-bold text-lg text-green-600">Free</p>
                : <p className="font-bold text-lg text-green-600">₹{totalValue.toLocaleString('en-IN')}</p>
              }
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Match Score</p>
              <p className="font-bold text-lg text-indigo-600">{data.match.matchScore}%</p>
            </div>
          </div>
        </div>

        {/* Right: Action */}
        <div className="p-8 md:w-2/3">
          {confirmed ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Transaction Completed!</h2>
              <p className="text-slate-500 text-center max-w-sm">
                This circular exchange has been recorded. Check your Impact Dashboard to see the updated sustainability metrics.
              </p>
              <Link
                href="/impact"
                className="mt-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors"
              >
                View Impact Dashboard →
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Sign Agreement</h2>
                  <p className="text-sm text-slate-500">Review and confirm the logistics arrangement.</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Pickup
                  </span>
                  <span className="font-medium">{data.resource.location} • {pickupDate}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-3">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Delivery
                  </span>
                  <span className="font-medium">{data.requirement.location} • {pickupDate}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-3">
                  <span className="text-slate-600">Distance</span>
                  <span className="font-medium">{data.match.distanceKm} km</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-3">
                  <span className="text-slate-600">Estimated Transport Cost</span>
                  <span className="font-medium">₹{transportCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-3">
                  <span className="text-slate-600">Transport Method</span>
                  <span className="font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                    EV Truck (Low Emission)
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Link
                  href="/matches"
                  className="px-5 py-2 border rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Back to Matches
                </Link>
                <button
                  id="btn-sign-confirm"
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {confirming
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Truck className="w-4 h-4" />
                  }
                  {confirming ? 'Confirming...' : 'Sign & Schedule Logistics'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
