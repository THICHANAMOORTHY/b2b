"use client";

import { useState } from "react";
import { X, Search, Loader2, CheckCircle2 } from "lucide-react";
import { createRequirement, generateMatches } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Props {
  companyId: string;
  onClose: () => void;
}

export function PostRequirementModal({ companyId, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    materialType: "",
    quantity: "",
    unit: "tons",
    quality: "",
    requiredDate: "",
    location: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    try {
      await createRequirement({
        companyId,
        materialType: form.materialType,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        quality: form.quality,
        requiredDate: form.requiredDate || defaultDate,
        location: form.location,
      });
      await generateMatches();
      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="agri-card w-full max-w-lg relative overflow-hidden border border-emerald-500/25 shadow-2xl bg-[#0e271a]/95">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 p-6 text-white relative overflow-hidden border-b border-emerald-500/20">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-md">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-outfit">Post Procurement Demand</h2>
                <p className="text-emerald-100 text-xs">AI will cross-match with crop residue & byproduct producers in real-time</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-200">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-xl font-bold text-white font-outfit">Requirement Broadcasted!</p>
              <p className="text-slate-300 text-xs text-center">AI recommendation engine has computed compatible agricultural & byproduct streams.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5 block">
                    Material / Feedstock Needed
                  </label>
                  <input
                    name="materialType"
                    value={form.materialType}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Rice Husk, Cotton Stalks, Bio-Char, Fly Ash"
                    className="w-full bg-white/[0.05] border border-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5 block">
                    Required Quantity
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    placeholder="250"
                    className="w-full bg-white/[0.05] border border-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5 block">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full bg-[#0a2316] border border-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition"
                  >
                    <option value="tons">tons (MT)</option>
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="units">units</option>
                    <option value="m³">m³</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5 block">
                    Quality / Minimum Grade
                  </label>
                  <input
                    name="quality"
                    value={form.quality}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Low Ash, Recycled Grade"
                    className="w-full bg-white/[0.05] border border-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5 block">
                    Required By Date
                  </label>
                  <input
                    name="requiredDate"
                    type="date"
                    value={form.requiredDate || defaultDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/[0.05] border border-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5 block">
                    Receiving Facility / Bio-Hub Location
                  </label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Coimbatore Bio-Plant #2"
                    className="w-full bg-white/[0.05] border border-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-emerald-500/15 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 text-xs font-bold transition border border-emerald-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="agri-btn-primary text-xs py-2.5 px-6"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>{loading ? "Broadcasting..." : "Broadcast Demand"}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
