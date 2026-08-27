"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Company, fetchCompanies, createCompaniesBulk as apiCreateCompaniesBulk } from "@/lib/api";

interface CompanyContextType {
  companies: Company[];
  activeCompany: Company | null;
  loading: boolean;
  setActiveCompany: (company: Company) => void;
  switchCompanyById: (companyId: string) => void;
  refreshCompanies: () => Promise<Company[]>;
  addCompaniesBulk: (newCompanies: (Omit<Company, "id"> & { id?: string })[]) => Promise<Company[]>;
  isAddCompanyModalOpen: boolean;
  setIsAddCompanyModalOpen: (open: boolean) => void;
  openAddCompanyModal: () => void;
  closeAddCompanyModal: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "circula_active_company_id";

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompanyState] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);

  const refreshCompanies = useCallback(async (): Promise<Company[]> => {
    try {
      const data = await fetchCompanies();
      setCompanies(data);

      const savedId = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
      let matched = data.find((c) => c.id === savedId);

      if (!matched && data.length > 0) {
        matched = data.find((c) => c.id === "c1") || data[0];
      }

      if (matched) {
        setActiveCompanyState(matched);
      }
      return data;
    } catch (err) {
      console.error("Failed to load companies:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCompanies();
  }, [refreshCompanies]);

  const setActiveCompany = (company: Company) => {
    setActiveCompanyState(company);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, company.id);
    }
  };

  const switchCompanyById = (companyId: string) => {
    const found = companies.find((c) => c.id === companyId);
    if (found) {
      setActiveCompany(found);
    }
  };

  const addCompaniesBulk = async (
    newCompanies: (Omit<Company, "id"> & { id?: string })[]
  ): Promise<Company[]> => {
    const created = await apiCreateCompaniesBulk(newCompanies);
    const updated = await refreshCompanies();
    if (created.length > 0) {
      const firstCreated = updated.find((c) => c.id === created[0].id) || created[0];
      setActiveCompany(firstCreated);
    }
    return created;
  };

  return (
    <CompanyContext.Provider
      value={{
        companies,
        activeCompany,
        loading,
        setActiveCompany,
        switchCompanyById,
        refreshCompanies,
        addCompaniesBulk,
        isAddCompanyModalOpen,
        setIsAddCompanyModalOpen,
        openAddCompanyModal: () => setIsAddCompanyModalOpen(true),
        closeAddCompanyModal: () => setIsAddCompanyModalOpen(false),
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
