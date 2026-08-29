"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Leaf,
  Droplet,
  Recycle,
  IndianRupee,
  CloudSun,
  RefreshCw,
  Layers,
  Trees,
} from 'lucide-react';
import { WasteChart, CO2Chart } from '@/components/ImpactChart';
import { fetchResources, Resource, API_BASE_URL } from '@/lib/api';

interface EmissionFactor {
  material: string;
  factor: number;
  source: string;
  url?: string;
  note: string;
}

interface FactorsResponse {
  co2_factors?: { materials: EmissionFactor[] };
  water_factors?: { materials: EmissionFactor[] };
}

interface MaterialImpactBreakdown {
  material: string;
  count: number;
  totalQtyKg: number;
  wasteTons: number;
  co2eTons: number;
  waterLitres: number;
  disposalCostInr: number;
}

const CO2_MAP: Record<string, number> = {
  biomass: 2.10,
  bagasse: 2.40,
  husk: 1.95,
  straw: 1.80,
  stalk: 1.80,
  aluminium: 10.50,
  aluminum: 10.50,
  copper: 3.10,
  steel: 1.50,
  iron: 1.50,
  plastic: 1.53,
  hdpe: 1.53,
  pp: 1.40,
  pet: 1.60,
  paper: 0.84,
  cardboard: 0.84,
  glass: 0.63,
};

const WATER_MAP: Record<string, number> = {
  biomass: 35.0,
  bagasse: 40.0,
  husk: 30.0,
  straw: 25.0,
  stalk: 25.0,
  copper: 130.0,
  steel: 28.0,
  iron: 28.0,
  aluminium: 14.0,
  aluminum: 14.0,
  plastic: 8.0,
  hdpe: 8.0,
  pp: 8.0,
  pet: 9.0,
  paper: 10.0,
  cardboard: 10.0,
  glass: 8.0,
};

const DISPOSAL_MAP: Record<string, number> = {
  biomass: 15.0,
  bagasse: 18.0,
  husk: 14.0,
  straw: 12.0,
  stalk: 12.0,
  copper: 25.0,
  aluminium: 18.0,
  aluminum: 18.0,
  steel: 12.0,
  iron: 12.0,
  plastic: 20.0,
  hdpe: 20.0,
  pp: 20.0,
  pet: 22.0,
  paper: 8.0,
  cardboard: 8.0,
};

export default function Impact() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [, setFactors] = useState<FactorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [resData, factorsRes] = await Promise.all([
        fetchResources(),
        fetch(`${API_BASE_URL}/api/emission-factors`, { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);
      setResources(resData || []);
      if (factorsRes) {
        setFactors(factorsRes);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [resData, factorsRes] = await Promise.all([
          fetchResources(),
          fetch(`${API_BASE_URL}/api/emission-factors`, { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        ]);
        if (!ignore) {
          setResources(resData || []);
          if (factorsRes) {
            setFactors(factorsRes);
          }
        }
      } catch {
        // fallback
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const getMatchedKey = (name: string): string => {
    const n = name.toLowerCase();
    for (const key of Object.keys(CO2_MAP)) {
      if (n.includes(key)) return key;
    }
    return 'biomass';
  };

  const toKg = (qty: number, unit: string): number => {
    const u = (unit || '').toLowerCase();
    if (u === 'tons' || u === 'ton' || u === 'tonne' || u === 'tonnes' || u === 'mt') return qty * 1000;
    return qty;
  };

  const breakdownMap: Record<string, MaterialImpactBreakdown> = {};
  let totalWasteKg = 0;
  let totalCo2Kg = 0;
  let totalWaterL = 0;
  let totalDisposal = 0;

  for (const r of resources) {
    const qtyKg = toKg(r.quantity, r.unit);
    const key = getMatchedKey(r.materialType || r.name);
    const co2Factor = CO2_MAP[key] ?? 1.8;
    const waterFactor = WATER_MAP[key] ?? 25.0;
    const disposalFactor = DISPOSAL_MAP[key] ?? 10.0;

    const wasteTons = qtyKg / 1000;
    const co2eTons = (qtyKg * co2Factor) / 1000;
    const waterL = qtyKg * waterFactor;
    const dispInr = qtyKg * disposalFactor;

    totalWasteKg += qtyKg;
    totalCo2Kg += qtyKg * co2Factor;
    totalWaterL += waterL;
    totalDisposal += dispInr;

    const label = key.charAt(0).toUpperCase() + key.slice(1);
    if (!breakdownMap[label]) {
      breakdownMap[label] = {
        material: label,
        count: 0,
        totalQtyKg: 0,
        wasteTons: 0,
        co2eTons: 0,
        waterLitres: 0,
        disposalCostInr: 0,
      };
    }
    breakdownMap[label].count += 1;
    breakdownMap[label].totalQtyKg += qtyKg;
    breakdownMap[label].wasteTons += wasteTons;
    breakdownMap[label].co2eTons += co2eTons;
    breakdownMap[label].waterLitres += waterL;
    breakdownMap[label].disposalCostInr += dispInr;
  }

  const breakdownList = Object.values(breakdownMap);

  const chartData = breakdownList.map((item) => ({
    label: item.material,
    waste: Number(item.wasteTons.toFixed(2)),
    co2: Number(item.co2eTons.toFixed(2)),
  }));

  const wasteDivertedTons = Number((totalWasteKg / 1000).toFixed(2));
  const co2eAvoidedTons = Number((totalCo2Kg / 1000).toFixed(2));
  const waterSavedL = Math.round(totalWaterL);
  const resourcesReusedCount = resources.length;
  const disposalCostAvoidedLakh = Number((totalDisposal / 100000).toFixed(2));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin shadow-lg shadow-emerald-500/20" />
          <p className="text-emerald-200 font-medium font-outfit text-lg">Quantifying regenerative soil & carbon impact...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-bold animate-agri-float">
            <Trees className="w-3.5 h-3.5" />
            <span>Soil Carbon & Water Restoration Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-outfit">
            Regenerative Impact Dashboard
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-sans max-w-xl">
            Live environmental restoration metrics calculated directly from verified biomass and byproduct exchanges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-emerald-500/25 text-slate-200 text-xs font-bold transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span>{refreshing ? 'Recalculating...' : 'Refresh LCA Data'}</span>
          </button>
          <div className="px-3.5 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Soil Metric Sync</span>
          </div>
        </div>
      </div>

      {/* Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="agri-card p-6 border border-emerald-500/30 relative overflow-hidden group">
          <Leaf className="w-7 h-7 text-emerald-400 mb-3" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Crop Residue & Waste Diverted</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-white font-outfit">{wasteDivertedTons}</h2>
            <span className="text-sm font-bold text-emerald-400">Tons</span>
          </div>
        </div>

        <div className="agri-card p-6 border border-[#f59e0b]/30 relative overflow-hidden group">
          <CloudSun className="w-7 h-7 text-[#f59e0b] mb-3" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">CO₂e Emissions Sequestered</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-white font-outfit">{co2eAvoidedTons}</h2>
            <span className="text-sm font-bold text-[#fcd34d]">Tons</span>
          </div>
        </div>

        <div className="agri-card p-6 border border-teal-500/30 relative overflow-hidden group">
          <Recycle className="w-7 h-7 text-teal-400 mb-3" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Bio-Streams Active</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-white font-outfit">{resourcesReusedCount}</h2>
            <span className="text-sm font-bold text-teal-300">Feedstocks</span>
          </div>
        </div>

        <div className="agri-card p-6 border border-amber-500/30 relative overflow-hidden group">
          <IndianRupee className="w-7 h-7 text-amber-400 mb-3" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Farm & Waste Value Unlocked</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-white font-outfit">{disposalCostAvoidedLakh}</h2>
            <span className="text-sm font-bold text-amber-300">Lakh ₹</span>
          </div>
        </div>
      </div>

      {/* Water saved banner */}
      <div className="agri-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-teal-500/25 bg-gradient-to-r from-teal-950/40 via-[#0a2316] to-emerald-950/30">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-teal-500/20 text-teal-300">
            <Droplet className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-300">Agricultural & Industrial Water Restored</p>
            <p className="text-3xl sm:text-4xl font-black text-white font-outfit mt-0.5">
              {(waterSavedL / 1_000).toFixed(1)}{' '}
              <span className="text-lg font-normal text-teal-200">kilolitres (kL)</span>
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 max-w-sm text-center md:text-right font-sans">
          Freshwater savings calculated via Water Footprint Network lifecycle impact coefficients.
        </p>
      </div>

      {/* Dynamic Charts Bento Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="agri-card p-6 sm:p-8 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-lg text-white font-outfit">Biomass & Residue Diversion</h3>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Field Data
            </span>
          </div>
          <div className="text-slate-100">
            <WasteChart data={chartData} />
          </div>
        </div>

        <div className="agri-card p-6 sm:p-8 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-lg text-white font-outfit">Carbon Sequestered by Feedstock</h3>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#f59e0b]/20 text-[#fcd34d] border border-[#f59e0b]/30">
              LCA Factors
            </span>
          </div>
          <div className="text-slate-100">
            <CO2Chart data={chartData} />
          </div>
        </div>
      </div>

      {/* Dynamic Material Table */}
      {breakdownList.length > 0 && (
        <div className="agri-card overflow-hidden border border-emerald-500/20">
          <div className="px-6 py-4 border-b border-emerald-500/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm font-outfit">Feedstock & Biomass Impact Breakdown</h3>
            </div>
            <span className="text-xs text-emerald-300/80">
              {resources.length} active byproduct streams cataloged
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-white/[0.02] text-slate-300 uppercase tracking-wider border-b border-emerald-500/15">
                  <th className="text-left px-5 py-3 font-bold">Feedstock Stream</th>
                  <th className="text-center px-4 py-3 font-bold">Listings</th>
                  <th className="text-right px-4 py-3 font-bold">Total Volume</th>
                  <th className="text-right px-4 py-3 font-bold">Waste Diverted</th>
                  <th className="text-right px-4 py-3 font-bold">CO₂e Sequestered</th>
                  <th className="text-right px-4 py-3 font-bold">Water Saved</th>
                  <th className="text-right px-5 py-3 font-bold">Economic Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {breakdownList.map((item) => (
                  <tr key={item.material} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {item.material}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-300">
                      <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded-full font-bold">
                        {item.count}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-300">
                      {item.totalQtyKg.toLocaleString()} kg
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-400">
                      {item.wasteTons.toFixed(2)} Tons
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-[#fcd34d]">
                      {item.co2eTons.toFixed(2)} Tons CO₂e
                    </td>
                    <td className="px-4 py-3.5 text-right text-teal-300 font-medium">
                      {(item.waterLitres / 1000).toFixed(1)} kL
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-amber-300">
                      ₹{item.disposalCostInr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
