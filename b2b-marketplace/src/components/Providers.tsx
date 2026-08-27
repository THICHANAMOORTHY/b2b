"use client";

import React from "react";
import { CompanyProvider, useCompany } from "@/lib/CompanyContext";
import { AddMultipleCompaniesModal } from "@/components/AddMultipleCompaniesModal";

function GlobalModals() {
  const { isAddCompanyModalOpen, closeAddCompanyModal } = useCompany();

  if (!isAddCompanyModalOpen) return null;
  return <AddMultipleCompaniesModal onClose={closeAddCompanyModal} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CompanyProvider>
      {children}
      <GlobalModals />
    </CompanyProvider>
  );
}
