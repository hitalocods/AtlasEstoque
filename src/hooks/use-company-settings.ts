"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CompanySettings } from "@/types";

const settingsKey = "atlas-company-settings";

export const defaultCompanySettings: CompanySettings = {
  companyName: "Atlas Estoque",
  cnpj: "",
  phone: "",
  address: "CEASA",
};

function readCompanySettings() {
  if (typeof window === "undefined") return defaultCompanySettings;
  const saved = window.localStorage.getItem(settingsKey);
  return saved
    ? { ...defaultCompanySettings, ...(JSON.parse(saved) as CompanySettings) }
    : defaultCompanySettings;
}

export function useCompanySettings() {
  const [companySettings, setCompanySettings] =
    useState<CompanySettings>(defaultCompanySettings);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      await Promise.resolve();
      if (active) setCompanySettings(readCompanySettings());
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  function saveCompanySettings(settings: CompanySettings) {
    setCompanySettings(settings);
    window.localStorage.setItem(settingsKey, JSON.stringify(settings));
    toast.success("Dados da empresa salvos.");
  }

  return { companySettings, saveCompanySettings };
}
