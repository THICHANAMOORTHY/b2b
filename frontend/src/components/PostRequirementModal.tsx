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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] font-outfit">Post Procurement Demand</h2>
              <p className="text-xs text-[#64748B]">Specify secondary raw material requirements for AI discovery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-14 h-14 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-[#0F172A] font-outfit">Procurement Demand Posted!</p>
              <p className="text-xs text-[#64748B] text-center">AI matchmaking engine is scanning producers for compatibility matches.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 block">
                    Required Material / Feedstock
                  </label>
                  <input
                    name="materialType"
                    value={form.materialType}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Recycled Copper Scrap, Secondary Aluminum Ingot"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 block">
                    Target Volume Needed
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    min="0.1"
                    step="any"
                    placeholder="e.g. 1000"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 block">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] transition"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="tons">tons (Metric Tons)</option>
                    <option value="litres">litres</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 block">
                    Minimum Quality Grade
                  </label>
                  <input
                    name="quality"
                    value={form.quality}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Grade A or Grade B Industrial"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 block">
                    Receiving Facility Location
                  </label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Chennai, Ambattur"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 block">
                    Target Required Date
                  </label>
                  <input
                    type="date"
                    name="requiredDate"
                    value={form.requiredDate}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] transition"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Posting &amp; Matching...</span>
                    </>
                  ) : (
                    <span>Post &amp; Run AI Matching</span>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
