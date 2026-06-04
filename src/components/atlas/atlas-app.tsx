"use client";

import { useState } from "react";
import { AppShell, type ViewId } from "@/components/atlas/app-shell";
import { LoginScreen } from "@/components/atlas/login-screen";
import {
  DashboardPage,
  HistoryPage,
  NotesPage,
  OperationPage,
  ProductsPage,
  SalesPage,
  SettingsPage,
  StockPage,
} from "@/components/atlas/pages";
import { useAtlasStore } from "@/hooks/use-atlas-store";
import { useAuth } from "@/hooks/use-auth";
import { useCompanySettings } from "@/hooks/use-company-settings";

export function AtlasApp() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const auth = useAuth();
  const store = useAtlasStore();
  const company = useCompanySettings();

  if (auth.loading && !auth.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d9a928] border-t-[#0f2b2e]" />
      </div>
    );
  }

  if (!auth.user) {
    return (
      <LoginScreen
        onLogin={auth.login}
        loading={auth.loading}
        firebaseEnabled={auth.firebaseEnabled}
      />
    );
  }

  return (
    <AppShell
      activeView={activeView}
      onViewChange={setActiveView}
      onLogout={auth.logout}
      userEmail={auth.user.email}
    >
      {activeView === "dashboard" && <DashboardPage {...store} />}
      {activeView === "produtos" && <ProductsPage {...store} />}
      {activeView === "estoque" && <StockPage {...store} />}
      {activeView === "vendas" && <SalesPage {...store} {...company} />}
      {activeView === "notas" && <NotesPage {...store} />}
      {activeView === "operacao" && <OperationPage {...store} />}
      {activeView === "historico" && <HistoryPage {...store} />}
      {activeView === "configuracoes" && <SettingsPage {...store} {...company} />}
    </AppShell>
  );
}
