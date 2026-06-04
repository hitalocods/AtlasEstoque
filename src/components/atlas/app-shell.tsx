"use client";

import {
  BarChart3,
  Boxes,
  ClipboardList,
  FileText,
  History,
  Leaf,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type ViewId =
  | "dashboard"
  | "produtos"
  | "estoque"
  | "vendas"
  | "notas"
  | "historico"
  | "configuracoes";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "produtos", label: "Produtos", icon: Package },
  { id: "estoque", label: "Estoque", icon: Boxes },
  { id: "vendas", label: "Vendas", icon: ShoppingCart },
  { id: "notas", label: "Notas", icon: FileText },
  { id: "historico", label: "Histórico", icon: History },
  { id: "configuracoes", label: "Configurações", icon: Settings },
] as const;

type AppShellProps = {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
  onLogout: () => void;
  userEmail?: string | null;
  children: ReactNode;
};

function SidebarContent({
  activeView,
  onViewChange,
  onLogout,
  userEmail,
}: Omit<AppShellProps, "children">) {
  return (
    <div className="flex h-full flex-col bg-[#0f2b2e] text-white">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d9a928] text-[#0f2b2e]">
            <Leaf className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">Atlas Estoque</p>
            <p className="truncate text-xs text-white/55">Operação CEASA</p>
          </div>
        </div>
      </div>
      <Separator className="bg-white/10" />
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition",
                active
                  ? "bg-[#d9a928] text-[#0f2b2e]"
                  : "text-white/72 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4">
        <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/50">Usuário</p>
          <p className="truncate text-sm font-medium">{userEmail ?? "Operação"}</p>
        </div>
        <Button
          variant="ghost"
          className="h-11 w-full justify-start gap-2 text-white/72 hover:bg-white/8 hover:text-white"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  const active = navItems.find((item) => item.id === props.activeView);

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#142321]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <SidebarContent {...props} />
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#dce3df] bg-[#f5f7f6]/92 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 border-0 bg-[#0f2b2e] p-0">
                  <SheetTitle className="sr-only">Navegação</SheetTitle>
                  <SidebarContent {...props} />
                </SheetContent>
              </Sheet>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9b7513]">
                  Atlas Estoque
                </p>
                <h1 className="text-xl font-semibold sm:text-2xl">{active?.label}</h1>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-[#dce3df] bg-white px-3 py-2 text-sm text-muted-foreground sm:flex">
              <ClipboardList className="h-4 w-4 text-[#9b7513]" />
              Controle interno
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">{props.children}</main>
      </div>
    </div>
  );
}

