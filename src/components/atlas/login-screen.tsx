"use client";

import { motion } from "framer-motion";
import { Leaf, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginScreenProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
  firebaseEnabled: boolean;
};

export function LoginScreen({ onLogin, loading, firebaseEnabled }: LoginScreenProps) {
  const [email, setEmail] = useState("operacao@atlasestoque.local");
  const [password, setPassword] = useState("atlas123");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      toast.error("Informe email e senha.");
      return;
    }
    await onLogin(email, password);
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#142321]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-[#0f2b2e] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d9a928] text-[#0f2b2e]">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">Atlas Estoque</p>
              <p className="text-sm text-white/60">CEASA | frutas e verduras</p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-xl"
          >
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-[#d9a928]">
              Operação interna
            </p>
            <h1 className="text-5xl font-semibold leading-tight">
              Controle rápido de estoque, vendas e notas.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/68">
              Uma interface limpa para rotina de box: produtos, movimentações,
              PDV simples e impressão sem desviar do trabalho.
            </p>
          </motion.div>
          <div className="grid grid-cols-3 gap-3 text-sm text-white/70">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              Estoque em tempo real
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              Nota bloqueada ao finalizar
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              Baixa somente no fechamento
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f2b2e] text-[#d9a928]">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold">Atlas Estoque</p>
                <p className="text-sm text-muted-foreground">CEASA</p>
              </div>
            </div>
            <Card className="border-[#dce3df] shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-7">
                  <h2 className="text-2xl font-semibold">Entrar no sistema</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {firebaseEnabled
                      ? "Autenticação conectada ao Firebase."
                      : "Sem variáveis Firebase: acesso em modo demonstração local."}
                  </p>
                </div>
                <form className="space-y-5" onSubmit={submit}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="h-12 pl-10"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        className="h-12 pl-10"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="h-12 w-full bg-[#0f2b2e] text-white hover:bg-[#153a3d]"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

