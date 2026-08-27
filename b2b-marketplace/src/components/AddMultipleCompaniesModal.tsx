"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  FileText,
  LayoutGrid,
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldCheck,
  Briefcase,
  Layers,
} from "lucide-react";
import { useCompany } from "@/lib/CompanyContext";

interface CompanyRow {
  id_temp: string;
  name: string;
  industry: string;
  location: string;
  verificationStatus: string;
}

const INDUSTRY_OPTIONS = [
  "Manufacturing",
  "Electronics & Tech",
  "Metallurgy & Steel",
  "Chemical & Petrochemical",
  "Automotive & Transport",
  "Plastics & Polymers",
  "Textiles & Garments",
  "Paper & Packaging",
  "Construction & Materials",
  "Pharmaceuticals",
  "Energy & Renewables",
  "Recycling & Waste Management",
];

const VERIFICATION_OPTIONS = ["Verified", "Pending", "ISO Certified", "Audit Cleared"];

const SAMPLE_COMPANIES: Omit<CompanyRow, "id_temp">[] = [
  {
    name: "Apex Steel Rolling Mills",
    industry: "Metallurgy & Steel",
    location: "Chennai Ambattur",
    verificationStatus: "Verified",
  },
  {
    name: "GreenTech Polymer Solutions",
    industry: "Plastics & Polymers",
    location: "Bangalore Peenya",
    verificationStatus: "ISO Certified",
  },
  {
    name: "Bharat Precision Casting Ltd",
    industry: "Automotive & Transport",
    location: "Pune Chakan",
    verificationStatus: "Verified",
  },
  {
    name: "EcoClean Industrial Solvents",
    industry: "Chemical & Petrochemical",
    location: "Hyderabad Bollaram",
    verificationStatus: "Audit Cleared",
  },
  {
    name: "SunPower Electronics Pvt Ltd",
    industry: "Electronics & Tech",
    location: "Coimbatore SIDCO",
    verificationStatus: "Verified",
  },
];

interface Props {
  onClose?: () => void;
}

export function AddMultipleCompaniesModal({ onClose }: Props) {
  const { addCompaniesBulk, closeAddCompanyModal } = useCompany();
  const handleClose = onClose || closeAddCompanyModal;

  const [activeTab, setActiveTab] = useState<"form" | "csv">("form");
  const [csvText, setCsvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [rows, setRows] = useState<CompanyRow[]>([
    {
      id_temp: "row-1",
      name: "",
      industry: "Manufacturing",
      location: "Chennai",
      verificationStatus: "Verified",
    },
    {
      id_temp: "row-2",
      name: "",
      industry: "Electronics & Tech",
      location: "Bangalore",
      verificationStatus: "Verified",
    },
  ]);

  const handleRowChange = (index: number, field: keyof CompanyRow, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setErrorMessage(null);
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id_temp: `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: "",
        industry: "Manufacturing",
        location: "Chennai",
        verificationStatus: "Verified",
      },
    ]);
  };

  const handleDuplicateRow = (index: number) => {
    const target = rows[index];
    setRows((prev) => [
      ...prev.slice(0, index + 1),
      {
        ...target,
        id_temp: `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: target.name ? `${target.name} (Copy)` : "",
      },
      ...prev.slice(index + 1),
    ]);
  };

  const handleDeleteRow = (index: number) => {
    if (rows.length <= 1) {
      setRows([
        {
          id_temp: "row-1",
          name: "",
          industry: "Manufacturing",
          location: "Chennai",
          verificationStatus: "Verified",
        },
      ]);
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLoadSamples = () => {
    setRows(
      SAMPLE_COMPANIES.map((c, i) => ({
        ...c,
        id_temp: `sample-${i}-${Date.now()}`,
      }))
    );
    setErrorMessage(null);
  };

  const handleParseCsv = () => {
    if (!csvText.trim()) {
      setErrorMessage("Please paste some text or CSV lines first.");
      return;
    }

    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed: CompanyRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(/[,|\t]/).map((p) => p.trim());
      if (parts[0]) {
        parsed.push({
          id_temp: `csv-${i}-${Date.now()}`,
          name: parts[0],
          industry: parts[1] || "Manufacturing",
          location: parts[2] || "Chennai",
          verificationStatus: parts[3] || "Verified",
        });
      }
    }

    if (parsed.length === 0) {
      setErrorMessage("No valid company rows found in pasted text.");
      return;
    }

    setRows(parsed);
    setActiveTab("form");
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validRows = rows.filter((r) => r.name.trim().length > 0);
    if (validRows.length === 0) {
      setErrorMessage("Please enter at least one company name.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const payload = validRows.map((r) => ({
        name: r.name.trim(),
        industry: r.industry.trim(),
        location: r.location.trim(),
        verificationStatus: r.verificationStatus.trim(),
      }));

      const created = await addCompaniesBulk(payload);
      setCreatedCount(created.length);
      setSuccess(true);

      setTimeout(() => {
        handleClose();
      }, 1400);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to add companies. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="flex items-center gap-3.5 relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Add Multiple Companies</h2>
                <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Batch Session
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-0.5">
                Onboard multiple enterprise partners to establish circular supply & demand matches.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Switcher & Quick Actions */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "form"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid Table ({rows.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("csv")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "csv"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Paste CSV / Text
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSamples}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xl"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Load 5 Sample Companies
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <span className="font-semibold">Error:</span> {errorMessage}
            </div>
          )}

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Companies Added Successfully!</h3>
              <p className="text-slate-500 text-sm max-w-md">
                Successfully onboarded <span className="font-semibold text-emerald-600">{createdCount}</span> new{" "}
                {createdCount === 1 ? "company" : "companies"} into the Circula ecosystem.
              </p>
            </div>
          ) : activeTab === "csv" ? (
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Format Guide:</p>
                <p>Paste one company per line with fields separated by commas or tabs:</p>
                <code className="block bg-white p-2 rounded border border-slate-200 text-emerald-700 font-mono text-[11px] mt-1">
                  Company Name, Industry, Location, Status (Optional)
                  <br />
                  Tata Advanced Materials, Metallurgy, Chennai, Verified
                  <br />
                  Apex Clean Biofuel, Energy & Renewables, Pune, ISO Certified
                </code>
              </div>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Paste company list here..."
                rows={8}
                className="w-full p-3.5 text-sm font-mono border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-shadow"
              />
              <button
                type="button"
                onClick={handleParseCsv}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all"
              >
                <Layers className="w-3.5 h-3.5" /> Parse into Table Rows
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Row List */}
              <div className="space-y-3">
                {rows.map((row, idx) => (
                  <div
                    key={row.id_temp}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-3 group relative"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        Company #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(idx)}
                          title="Duplicate this row"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(idx)}
                          title="Remove row"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      {/* Name */}
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={row.name}
                            onChange={(e) => handleRowChange(idx, "name", e.target.value)}
                            placeholder="e.g. Apex Industrial Works"
                            className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* Industry */}
                      <div className="md:col-span-3">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          Industry Sector
                        </label>
                        <div className="relative">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            value={row.industry}
                            onChange={(e) => handleRowChange(idx, "industry", e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                          >
                            {INDUSTRY_OPTIONS.map((ind) => (
                              <option key={ind} value={ind}>
                                {ind}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="md:col-span-3">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          City / Hub Location
                        </label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={row.location}
                            onChange={(e) => handleRowChange(idx, "location", e.target.value)}
                            placeholder="e.g. Chennai, Bangalore"
                            className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* Verification */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          Status
                        </label>
                        <div className="relative">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            value={row.verificationStatus}
                            onChange={(e) => handleRowChange(idx, "verificationStatus", e.target.value)}
                            className="w-full pl-8 pr-2 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                          >
                            {VERIFICATION_OPTIONS.map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add row button */}
              <button
                type="button"
                onClick={handleAddRow}
                className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/50 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                Add Another Company Row
              </button>
            </div>
          )}
        </form>

        {/* Footer */}
        {!success && (
          <div className="p-5 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Total to add:{" "}
              <span className="font-bold text-slate-800">
                {rows.filter((r) => r.name.trim().length > 0).length} valid company profile(s)
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 sm:flex-none px-5 py-2.5 border border-slate-200 hover:bg-white text-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-7 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Companies...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create {rows.filter((r) => r.name.trim().length > 0).length || rows.length} Companies
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
