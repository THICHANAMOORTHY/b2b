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
    unit: "kg",
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
      // Trigger AI match generation automatically
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

  // Default date: 30 days from now
  const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-[100px]" />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Post Requirement</h2>
                <p className="text-blue-100 text-sm">Find the materials you need from the network</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle2 className="w-16 h-16 text-blue-500" />
              <p className="text-lg font-semibold text-slate-900">Requirement Posted!</p>
              <p className="text-slate-500 text-sm text-center">
                AI matching engine is scanning the network for the best suppliers.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Material Type Needed
                  </label>
                  <input
                    name="materialType"
                    value={form.materialType}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Copper, Aluminium, Plastic"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Quantity Needed
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    placeholder="800"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition bg-white"
                  >
                    <option>kg</option>
                    <option>tons</option>
                    <option>liters</option>
                    <option>units</option>
                    <option>m³</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Quality Grade Required
                  </label>
                  <input
                    name="quality"
                    value={form.quality}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Industrial Grade"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Required By Date
                  </label>
                  <input
                    name="requiredDate"
                    type="date"
                    value={form.requiredDate || defaultDate}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Delivery Location
                  </label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Chennai South"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2 mt-2">
                <Search className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Our AI engine will immediately scan the network and generate ranked match recommendations after you post.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {loading ? "Posting & Matching..." : "Post & Find Matches"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
