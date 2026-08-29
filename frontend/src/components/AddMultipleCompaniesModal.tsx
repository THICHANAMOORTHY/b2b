"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  FileText,
  LayoutGrid,
  CheckCircle2,
  Loader2,
  Building2,
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
  "Metallurgy & Steel",
  "Automotive & Foundry",
  "Chemical & Petrochemical",
  "Plastics & Polymers",
  "Paper & Packaging",
  "Electronics & Assemblies",
  "Construction & Materials",
  "Recycling & Waste Management",
];

const VERIFICATION_OPTIONS = ["Verified", "Pending", "ISO 14044 Certified", "Audit Cleared"];

const SAMPLE_ORGANIZATIONS: Omit<CompanyRow, "id_temp">[] = [
  {
    name: "ABC Auto Components Foundry",
    industry: "Automotive & Foundry",
    location: "Chennai Sriperumbudur",
    verificationStatus: "Verified",
  },
  {
    name: "Southern Copper Alloys & Wire Corp",
    industry: "Metallurgy & Steel",
    location: "Ambattur Industrial Estate",
    verificationStatus: "ISO 14044 Certified",
  },
  {
    name: "Apex Polymer & HDPE Reprocessors",
    industry: "Plastics & Polymers",
    location: "Guindy SIDCO",
    verificationStatus: "Verified",
  },
  {
    name: "Tamil Nadu Circular Paper & Pulp",
    industry: "Paper & Packaging",
    location: "Madurai Corridor",
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

  const rowCounterRef = React.useRef(4);

  const [rows, setRows] = useState<CompanyRow[]>([
    {
      id_temp: "row-1",
      name: "",
      industry: "Manufacturing",
      location: "",
      verificationStatus: "Verified",
    },
    {
      id_temp: "row-2",
      name: "",
      industry: "Metallurgy & Steel",
      location: "",
      verificationStatus: "Verified",
    },
    {
      id_temp: "row-3",
      name: "",
      industry: "Plastics & Polymers",
      location: "",
      verificationStatus: "ISO 14044 Certified",
    },
  ]);

  const handleAddRow = () => {
    const newId = `row-${rowCounterRef.current++}`;
    setRows((prev) => [
      ...prev,
      {
        id_temp: newId,
        name: "",
        industry: "Manufacturing",
        location: "",
        verificationStatus: "Verified",
      },
    ]);
  };

  const handleDuplicateRow = (index: number) => {
    const target = rows[index];
    const newId = `row-${rowCounterRef.current++}`;
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
          industry: "Manufacturing",
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
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleLoadSamples = () => {
    const populated: CompanyRow[] = SAMPLE_ORGANIZATIONS.map((sample, idx) => ({
      ...sample,
      id_temp: `sample-${idx + 1}`,
    }));
    setRows(populated);
  };

  const handleApplyCsv = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split("\n");
    const parsed: CompanyRow[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 1 && parts[0] !== "") {
        parsed.push({
          id_temp: `csv-row-${idx + 1}`,
          name: parts[0] || "",
          industry: parts[1] || "Manufacturing",
          location: parts[2] || "Chennai",
          verificationStatus: parts[3] || "Verified",
        });
      }
    });

    if (parsed.length > 0) {
      setRows(parsed);
      setActiveTab("form");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validRows = rows.filter((r) => r.name.trim() !== "");

    if (validRows.length === 0) {
      setErrorMessage("Please enter at least one facility name.");
      return;
    }

    setLoading(true);

    try {
      const payload = validRows.map((r) => ({
        name: r.name.trim(),
        industry: r.industry.trim(),
        location: r.location.trim() || "Chennai",
        verificationStatus: r.verificationStatus.trim(),
      }));

      const created = await addCompaniesBulk(payload);
      setCreatedCount(created.length);
      setSuccess(true);

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to register organizations.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] font-outfit">Enroll Organizations in Bulk</h2>
              <p className="text-xs text-[#64748B]">Batch-onboard secondary material producers and circular manufacturers</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Sample Actions */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "form"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid Form ({rows.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("csv")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "csv"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CSV Import</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSamples}
              className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#2563EB] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Industrial Sample Nodes</span>
            </button>

            {activeTab === "form" && (
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold text-[#0F172A] font-outfit">
                {createdCount} Organizations Successfully Enrolled!
              </p>
              <p className="text-xs text-[#64748B] text-center">
                Industrial nodes are now available in the top perspective switcher.
              </p>
            </div>
          ) : activeTab === "csv" ? (
            <div className="space-y-4">
              <p className="text-xs text-[#64748B]">
                Paste comma-separated rows in format: <code className="bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#0F172A] font-bold">Facility Name, Industry, Location, VerificationStatus</code>
              </p>
              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Apex Steel Works, Metallurgy & Steel, Chennai, Verified&#10;Southern Polymer Corp, Plastics & Polymers, Sriperumbudur, ISO 14044 Certified"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#2563EB]"
              />
              <button
                type="button"
                onClick={handleApplyCsv}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-semibold hover:bg-[#1D4ED8]"
              >
                Parse into Grid Form
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {errorMessage && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl text-xs text-[#EF4444] font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2.5">
                {rows.map((row, idx) => (
                  <div
                    key={row.id_temp}
                    className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-3 text-xs"
                  >
                    <span className="w-6 text-center font-bold text-[#94A3B8]">{idx + 1}</span>

                    <input
                      type="text"
                      placeholder="Organization / Facility Name *"
                      value={row.name}
                      onChange={(e) => handleRowChange(idx, "name", e.target.value)}
                      className="flex-1 bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                    />

                    <select
                      value={row.industry}
                      onChange={(e) => handleRowChange(idx, "industry", e.target.value)}
                      className="w-44 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                    >
                      {INDUSTRY_OPTIONS.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="City / Hub"
                      value={row.location}
                      onChange={(e) => handleRowChange(idx, "location", e.target.value)}
                      className="w-36 bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                    />

                    <select
                      value={row.verificationStatus}
                      onChange={(e) => handleRowChange(idx, "verificationStatus", e.target.value)}
                      className="w-32 bg-white border border-[#E2E8F0] rounded-lg px-2 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                    >
                      {VERIFICATION_OPTIONS.map((ver) => (
                        <option key={ver} value={ver}>{ver}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(idx)}
                        className="p-1.5 text-[#94A3B8] hover:text-[#2563EB] hover:bg-white rounded-lg transition"
                        title="Duplicate row"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] hover:bg-white rounded-lg transition"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enrolling Organizations...</span>
                    </>
                  ) : (
                    <span>Register {rows.filter(r => r.name.trim() !== "").length || 1} Organizations</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
