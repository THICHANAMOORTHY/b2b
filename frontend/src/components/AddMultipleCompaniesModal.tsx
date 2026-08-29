"use client";

import React, { useState } from "react";
import {
  X,
  Sprout,
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
  Wheat,
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
  "Agriculture & Farming",
  "Biomass & Bioenergy",
  "Organic Fertilizers & Soil",
  "Agro-Processing & Mills",
  "Manufacturing",
  "Metallurgy & Steel",
  "Chemical & Petrochemical",
  "Plastics & Polymers",
  "Paper & Packaging",
  "Construction & Materials",
  "Recycling & Waste Management",
];

const VERIFICATION_OPTIONS = ["Verified", "Pending", "Organic Certified", "ISO 14044 Certified", "Audit Cleared"];

const SAMPLE_ORGANIZATIONS: Omit<CompanyRow, "id_temp">[] = [
  {
    name: "Cauvery Organic Agro Collective",
    industry: "Agriculture & Farming",
    location: "Tanjore Bio Hub",
    verificationStatus: "Organic Certified",
  },
  {
    name: "Apex Biomass & Biofuel Refinery",
    industry: "Biomass & Bioenergy",
    location: "Trichy Industrial Corridor",
    verificationStatus: "ISO 14044 Certified",
  },
  {
    name: "GreenEarth Soil Nutrition Works",
    industry: "Organic Fertilizers & Soil",
    location: "Coimbatore SIDCO",
    verificationStatus: "Verified",
  },
  {
    name: "Southern Bagasse Paper Products",
    industry: "Paper & Packaging",
    location: "Madurai Hub",
    verificationStatus: "Verified",
  },
  {
    name: "EcoSteel Metallurgical Works",
    industry: "Metallurgy & Steel",
    location: "Salem Industrial Estate",
    verificationStatus: "Audit Cleared",
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
      industry: "Agriculture & Farming",
      location: "",
      verificationStatus: "Verified",
    },
    {
      id_temp: "row-2",
      name: "",
      industry: "Biomass & Bioenergy",
      location: "",
      verificationStatus: "Organic Certified",
    },
    {
      id_temp: "row-3",
      name: "",
      industry: "Organic Fertilizers & Soil",
      location: "",
      verificationStatus: "ISO 14044 Certified",
    },
  ]);

  const handleAddRow = () => {
    const newId = `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setRows((prev) => [
      ...prev,
      {
        id_temp: newId,
        name: "",
        industry: "Agriculture & Farming",
        location: "",
        verificationStatus: "Verified",
      },
    ]);
  };

  const handleDuplicateRow = (index: number) => {
    const target = rows[index];
    const newId = `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const duplicate: CompanyRow = {
      ...target,
      id_temp: newId,
      name: target.name ? `${target.name} (Copy)` : "",
    };
    const updated = [...rows];
    updated.splice(index + 1, 0, duplicate);
    setRows(updated);
  };

  const handleDeleteRow = (index: number) => {
    if (rows.length === 1) {
      setRows([
        {
          id_temp: "row-1",
          name: "",
          industry: "Agriculture & Farming",
          location: "",
          verificationStatus: "Verified",
        },
      ]);
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: keyof CompanyRow, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleLoadSamples = () => {
    const sampleRows: CompanyRow[] = SAMPLE_ORGANIZATIONS.map((s, idx) => ({
      ...s,
      id_temp: `sample-${Date.now()}-${idx}`,
    }));
    setRows(sampleRows);
    setErrorMessage(null);
  };

  const handleParseCsv = () => {
    if (!csvText.trim()) {
      setErrorMessage("Please paste CSV or tabular text first.");
      return;
    }

    const lines = csvText.split("\n").filter((l) => l.trim().length > 0);
    const parsed: CompanyRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const sep = line.includes("\t") ? "\t" : ",";
      const parts = line.split(sep).map((p) => p.trim());

      if (i === 0 && parts[0].toLowerCase().includes("name")) {
        continue;
      }

      if (parts.length >= 1 && parts[0].length > 0) {
        parsed.push({
          id_temp: `csv-${Date.now()}-${i}`,
          name: parts[0],
          industry: parts[1] || "Agriculture & Farming",
          location: parts[2] || "Coimbatore Hub",
          verificationStatus: parts[3] || "Verified",
        });
      }
    }

    if (parsed.length === 0) {
      setErrorMessage("No valid rows found in pasted text.");
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
      setErrorMessage("Please enter at least one organization name.");
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
      setErrorMessage(err.message || "Failed to add organizations. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="agri-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-emerald-500/25 shadow-2xl bg-[#0e271a]/95">
        {/* Modal Header */}
        <div className="p-6 border-b border-emerald-500/20 bg-gradient-to-r from-[#071910] via-[#0c2417] to-[#0e271a] text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-outfit text-white">Enroll Farms & Bio-Enterprises</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Batch Session
                </span>
              </div>
              <p className="text-emerald-300/80 text-xs mt-0.5">
                Onboard agricultural producers, biomass processors, and circular industrial plants.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Switcher & Quick Actions */}
        <div className="bg-white/[0.02] px-6 py-3 border-b border-emerald-500/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-white/[0.06] p-1 rounded-full border border-emerald-500/20">
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "form"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid Table ({rows.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("csv")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "csv"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
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
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3.5 py-1.5 rounded-full transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Load 5 Sample Farms & Hubs
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-200">
          {errorMessage && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {errorMessage}
            </div>
          )}

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white font-outfit">Organizations Enrolled!</h3>
              <p className="text-slate-300 text-xs max-w-md">
                Successfully onboarded <span className="font-bold text-emerald-400">{createdCount}</span> new{" "}
                organizations into the Circula bioeconomy network.
              </p>
            </div>
          ) : activeTab === "csv" ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-emerald-500/15 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white">Format Guide:</p>
                <p>Paste one organization per line with fields separated by commas or tabs:</p>
                <code className="block bg-black/40 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400 font-mono text-[11px] mt-1">
                  Cauvery Organic Agro Collective, Agriculture & Farming, Tanjore, Organic Certified
                </code>
              </div>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Paste farm/hub list here..."
                rows={8}
                className="w-full p-3.5 text-xs font-mono bg-white/[0.05] border border-emerald-500/20 rounded-2xl focus:border-emerald-400 outline-none text-white transition-colors"
              />
              <button
                type="button"
                onClick={handleParseCsv}
                className="agri-btn-secondary text-xs py-2 px-4"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> Parse into Table Rows
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row, idx) => (
                <div
                  key={row.id_temp}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/15 hover:border-emerald-500/30 transition-all space-y-3 group relative"
                >
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5 font-bold text-white font-outfit">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      Organization #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(idx)}
                        title="Duplicate this row"
                        className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        title="Remove row"
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Name */}
                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                        Organization Name <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={row.name}
                        onChange={(e) => handleRowChange(idx, "name", e.target.value)}
                        placeholder="e.g. Cauvery Organic Agro Collective"
                        className="w-full bg-white/[0.05] border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    {/* Industry */}
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                        Sector
                      </label>
                      <select
                        value={row.industry}
                        onChange={(e) => handleRowChange(idx, "industry", e.target.value)}
                        className="w-full bg-[#0a2316] border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                      >
                        {INDUSTRY_OPTIONS.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                        Location / Hub
                      </label>
                      <input
                        type="text"
                        value={row.location}
                        onChange={(e) => handleRowChange(idx, "location", e.target.value)}
                        placeholder="e.g. Tanjore, Coimbatore"
                        className="w-full bg-white/[0.05] border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                        Status
                      </label>
                      <select
                        value={row.verificationStatus}
                        onChange={(e) => handleRowChange(idx, "verificationStatus", e.target.value)}
                        className="w-full bg-[#0a2316] border border-emerald-500/20 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
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
              ))}

              <button
                type="button"
                onClick={handleAddRow}
                className="w-full py-3 border-2 border-dashed border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-500/5 rounded-2xl text-xs font-bold text-slate-300 hover:text-emerald-300 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                Add Another Organization Row
              </button>
            </div>
          )}
        </form>

        {/* Footer */}
        {!success && (
          <div className="p-5 border-t border-emerald-500/15 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              Valid entries to enroll:{" "}
              <span className="font-bold text-white">
                {rows.filter((r) => r.name.trim().length > 0).length} organization profile(s)
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition border border-emerald-500/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 sm:flex-none agri-btn-primary text-xs py-2.5 px-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Enroll {rows.filter((r) => r.name.trim().length > 0).length || rows.length} Organizations
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
