"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Search,
  PlusCircle,
  Building2,
  MapPin,
  ShieldCheck,
  Trash2,
  Loader2,
  Users,
  ArrowRightLeft,
  Briefcase,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { AddResourceModal } from "@/components/AddResourceModal";
import { PostRequirementModal } from "@/components/PostRequirementModal";
import {
  fetchResources,
  fetchRequirements,
  deleteResource,
  deleteRequirement,
  Resource,
  Requirement,
} from "@/lib/api";
import { useCompany } from "@/lib/CompanyContext";

export default function Dashboard() {
  const {
    companies,
    activeCompany,
    setActiveCompany,
    openAddCompanyModal,
    loading: companyLoading,
  } = useCompany();

  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [allRequirements, setAllRequirements] = useState<Requirement[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [showAddResource, setShowAddResource] = useState(false);
  const [showPostReq, setShowPostReq] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [resData, reqData] = await Promise.all([
        fetchResources(),
        fetchRequirements(),
      ]);

      setAllResources(resData);
      setAllRequirements(reqData);

      if (activeCompany) {
        setResources(resData.filter((r) => r.companyId === activeCompany.id));
        setRequirements(reqData.filter((r) => r.companyId === activeCompany.id));
      } else {
        setResources(resData);
        setRequirements(reqData);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCompany]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleModalClose = () => {
    setShowAddResource(false);
    setShowPostReq(false);
    fetchData();
  };

  const handleDeleteResource = async (e: React.MouseEvent, resId: string, resName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${resName}"?`)) return;

    setDeletingId(resId);
    try {
      await deleteResource(resId);
      setResources((prev) => prev.filter((r) => r.id !== resId));
      setAllResources((prev) => prev.filter((r) => r.id !== resId));
    } catch {
      alert("Failed to delete resource. Please try again.");
    } finally {
      setDeletingId(null);
      fetchData();
    }
  };

  const handleDeleteRequirement = async (e: React.MouseEvent, reqId: string, reqName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete requirement "${reqName}"?`)) return;

    setDeletingId(reqId);
    try {
      await deleteRequirement(reqId);
      setRequirements((prev) => prev.filter((r) => r.id !== reqId));
      setAllRequirements((prev) => prev.filter((r) => r.id !== reqId));
    } catch {
      alert("Failed to delete requirement. Please try again.");
    } finally {
      setDeletingId(null);
      fetchData();
    }
  };

  if (loading || companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 font-medium">Loading dashboard & company session...</p>
        </div>
      </div>
    );
  }

  if (!activeCompany && companies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 border shadow-sm max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Companies Found</h2>
          <p className="text-slate-500 text-sm">
            Get started by adding multiple companies to your circular economy ecosystem.
          </p>
          <button
            onClick={openAddCompanyModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Add Multiple Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showAddResource && activeCompany && (
        <AddResourceModal companyId={activeCompany.id} onClose={handleModalClose} />
      )}
      {showPostReq && activeCompany && (
        <PostRequirementModal companyId={activeCompany.id} onClose={handleModalClose} />
      )}

      {/* Top Company Session Selector Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-6 shadow-md border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Active Session
              </span>
              <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                {companies.length} Companies in System
              </span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">
              Switching perspectives updates your supply, demand & matchmaking views
            </p>
          </div>
        </div>

        {/* Quick Switcher Pills + Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 lg:pb-0">
            {companies.slice(0, 5).map((c) => {
              const isActive = activeCompany?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCompany(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-sm font-bold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current opacity-75" />
                  {c.name}
                </button>
              );
            })}
          </div>

          <button
            onClick={openAddCompanyModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm ml-auto lg:ml-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + Add Multiple Companies
          </button>
        </div>
      </div>

      {/* Main Company Header */}
      {activeCompany && (
        <div className="bg-white rounded-2xl p-8 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-start gap-6 relative">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
              <Building2 className="w-10 h-10 text-slate-600" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  {activeCompany.name}
                </h1>
                <span className="flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> {activeCompany.verificationStatus}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" /> {activeCompany.industry}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> {activeCompany.location}
                </span>
                <span className="text-xs text-slate-400">ID: {activeCompany.id}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 relative">
            <button
              id="btn-add-resource"
              onClick={() => setShowAddResource(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm shadow-green-200 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add Resource
            </button>
            <button
              id="btn-post-requirement"
              onClick={() => setShowPostReq(true)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Post Requirement
            </button>
          </div>
        </div>
      )}

      {/* Supply & Demand Columns */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Supply */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-green-100 text-green-700 p-1.5 rounded-lg">
                <Package className="w-5 h-5" />
              </span>
              My Supply (Byproducts)
              <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                {resources.length}
              </span>
            </h2>
            <Link href="/marketplace" className="text-sm font-medium text-green-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {resources.map((res) => (
              <div
                key={res.id}
                className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden card-hover"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-l-xl" />
                <div className="flex justify-between items-start">
                  <div className="pr-4">
                    <h3 className="font-semibold text-lg text-slate-800 group-hover:text-green-600 transition-colors">
                      {res.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {res.quality} • {res.location}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      <p className="font-bold text-lg">
                        {res.quantity}{" "}
                        <span className="text-sm font-normal text-slate-500">{res.unit}</span>
                      </p>
                      <p className="text-sm font-medium text-green-600 bg-green-50 inline-block px-2.5 py-0.5 rounded-full mt-1">
                        {res.price === 0 ? "Free" : `₹${res.price}/${res.unit}`}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteResource(e, res.id, res.name)}
                      disabled={deletingId === res.id}
                      title="Delete resource"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                      {deletingId === res.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {resources.length === 0 && (
              <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>No resources listed for {activeCompany?.name || "this company"}.</p>
                <button
                  onClick={() => setShowAddResource(true)}
                  className="mt-3 text-green-600 text-sm font-semibold hover:underline"
                >
                  + Add your first byproduct resource
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Demand */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
                <Search className="w-5 h-5" />
              </span>
              My Demand (Requirements)
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                {requirements.length}
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden card-hover"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-xl" />
                <div className="flex justify-between items-start">
                  <div className="pr-4">
                    <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                      {req.materialType}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {req.quality} • Required by {req.requiredDate}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      <p className="font-bold text-lg">
                        {req.quantity}{" "}
                        <span className="text-sm font-normal text-slate-500">{req.unit}</span>
                      </p>
                      <p className="text-sm font-medium text-blue-600 bg-blue-50 inline-block px-2.5 py-0.5 rounded-full mt-1">
                        Seeking
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteRequirement(e, req.id, req.materialType)}
                      disabled={deletingId === req.id}
                      title="Delete requirement"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                      {deletingId === req.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {requirements.length === 0 && (
              <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>No requirements posted for {activeCompany?.name || "this company"}.</p>
                <button
                  onClick={() => setShowPostReq(true)}
                  className="mt-3 text-blue-600 text-sm font-semibold hover:underline"
                >
                  + Post your first requirement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Network Overview Cards */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Network Ecosystem Stats</h3>
            <p className="text-xs text-slate-500">Live summary across all registered enterprise companies</p>
          </div>
          <button
            onClick={openAddCompanyModal}
            className="self-start sm:self-auto text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            + Add Multiple Companies
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-xl">
            <p className="text-3xl font-black text-emerald-700">{companies.length}</p>
            <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wider">
              Companies Enrolled
            </p>
          </div>
          <div className="p-4 bg-green-50/80 border border-green-100 rounded-xl">
            <p className="text-3xl font-black text-green-700">{allResources.length}</p>
            <p className="text-xs font-semibold text-green-600 mt-1 uppercase tracking-wider">
              Total Resources Listed
            </p>
          </div>
          <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-xl">
            <p className="text-3xl font-black text-blue-700">{allRequirements.length}</p>
            <p className="text-xs font-semibold text-blue-600 mt-1 uppercase tracking-wider">
              Total Requirements
            </p>
          </div>
          <Link
            href="/matches"
            className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl block hover:bg-indigo-100 transition-colors"
          >
            <p className="text-3xl font-black text-indigo-700 flex items-center justify-center gap-1">
              <Sparkles className="w-6 h-6" /> AI
            </p>
            <p className="text-xs font-semibold text-indigo-600 mt-1 uppercase tracking-wider">
              View Matches →
            </p>
          </Link>
        </div>

        {/* Company Directory Grid */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              Company Sessions Directory ({companies.length})
            </h4>
            <span className="text-xs text-slate-400">Click &quot;Switch Session&quot; to test as any company</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {companies.map((c) => {
              const isSelected = activeCompany?.id === c.id;
              const companyResCount = allResources.filter((r) => r.companyId === c.id).length;
              const companyReqCount = allRequirements.filter((r) => r.companyId === c.id).length;

              return (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20"
                      : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{c.name}</h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {c.industry} • {c.location}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold bg-white border px-2 py-0.5 rounded-full text-slate-600 flex-shrink-0">
                        {c.verificationStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                      <span>
                        Supply: <strong className="text-emerald-700">{companyResCount}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Demand: <strong className="text-blue-700">{companyReqCount}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveCompany(c)}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    {isSelected ? "Active Session" : "Switch to this Session"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
