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
    unit: "kg",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-bl-[100px]" />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Add Resource</h2>
                <p className="text-green-100 text-sm">List a byproduct for circular reuse</p>
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
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <p className="text-lg font-semibold text-slate-900">Resource Listed!</p>
              <p className="text-slate-500 text-sm">Your byproduct is now live on the marketplace.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Resource Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Copper Scrap Batch #12"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Material Type
                  </label>
                  <input
                    name="materialType"
                    value={form.materialType}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Copper"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Quality Grade
                  </label>
                  <input
                    name="quality"
                    value={form.quality}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Industrial Grade"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Quantity
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    placeholder="1000"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
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
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition bg-white"
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
                    Location
                  </label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Chennai North"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={form.availability}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition bg-white"
                  >
                    <option>Immediate</option>
                    <option>Within 1 week</option>
                    <option>Within 1 month</option>
                    <option>Flexible</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Price per unit (₹) — Enter 0 for Free
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder="45"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-4">
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
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                  {loading ? "Listing..." : "List Resource"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
