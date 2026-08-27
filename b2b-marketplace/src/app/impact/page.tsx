import { Leaf, Droplet, Recycle, IndianRupee, CloudSun } from 'lucide-react';
import { WasteChart, CO2Chart } from '@/components/ImpactChart';

async function getImpact() {
  const res = await fetch('http://localhost:8000/api/impact', { cache: 'no-store' });
  return res.json();
}

export default async function Impact() {
  const impact = await getImpact();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Circular Impact Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time sustainability metrics generated from your exchanges.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-700">Live Analytics Sync</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
          <Leaf className="w-8 h-8 text-green-100 mb-4" />
          <p className="text-green-100 font-medium mb-1">Waste Diverted</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black">{impact.wasteDiverted}</h2>
            <span className="text-green-200 font-medium">Tons</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
          <CloudSun className="w-8 h-8 text-sky-100 mb-4" />
          <p className="text-sky-100 font-medium mb-1">CO₂e Avoided</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black">{impact.co2eAvoided}</h2>
            <span className="text-sky-200 font-medium">Tons</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] transition-transform group-hover:scale-110 -z-10"></div>
          <Recycle className="w-8 h-8 text-indigo-500 mb-4" />
          <p className="text-slate-500 font-medium mb-1">Resources Reused</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-slate-900">{impact.resourcesReused}</h2>
            <span className="text-slate-400 font-medium">exchanges</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-50 rounded-bl-[100px] transition-transform group-hover:scale-110 -z-10"></div>
          <IndianRupee className="w-8 h-8 text-amber-500 mb-4" />
          <p className="text-slate-500 font-medium mb-1">Disposal Cost Avoided</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-slate-900">{(impact.disposalCostAvoided / 100000).toFixed(1)}</h2>
            <span className="text-slate-400 font-medium">Lakh ₹</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 mb-6">Waste Diversion Trend</h3>
          <WasteChart />
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 mb-6">Carbon Avoidance Trend</h3>
          <CO2Chart />
        </div>
      </div>
    </div>
  );
}
