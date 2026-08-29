"use client";

import { useState } from "react";
import { X, Package, Loader2, CheckCircle2 } from "lucide-react";
import { createResource } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Props {
  companyId: string;
  onClose: () => void;
}

export function AddResourceModal({ companyId, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    materialType: "",
    quantity: "",
    unit: "tons",
    quality: "",
    location: "",
    availability: "Immediate",
    price: "0",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createResource({
        name: form.name,
        materialType: form.materialType,
        companyId,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        quality: form.quality,
        location: form.location,
        availability: form.availability,
        price: parseFloat(form.price),
      });
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
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] font-outfit">New Material Listing</h2>
              <p className="text-xs text-[#64748B]">Catalog secondary raw material or scrap for AI matchmaking</p>
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
              <p className="text-base font-bold text-[#0F172A] font-outfit">Material Successfully Listed!</p>
              <p className="text-xs text-[#64748B] text-center">Your listing is now indexed for automated circular compatibility scoring.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 block">
                    Listing Title
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Copper Wire Scrap 99.9% Cu"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 block">
                    Material Type / Alloy
                  </label>
                  <input
                    name="materialType"
                    value={form.materialType}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Copper, Aluminum, HDPE"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 block">
                    Quality / Specification Grade
                  </label>
                  <input
                    name="quality"
                    value={form.quality}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Grade A, Industrial Clean"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 block">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    min="0.1"
                    step="any"
                    placeholder="e.g. 500"
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
                    Facility Location / City
                  </label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Chennai, Sriperumbudur"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 block">
                    Target Price (₹ per unit)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="0 for free disposal"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition"
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
                      <span>Indexing Listing...</span>
                    </>
                  ) : (
                    <span>Publish Listing</span>
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
