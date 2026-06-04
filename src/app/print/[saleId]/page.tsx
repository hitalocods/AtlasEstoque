"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { initialSales } from "@/lib/mock-data";
import { formatDate, money, number } from "@/lib/format";
import type { Sale } from "@/types";

export default function PrintPage() {
  const params = useParams<{ saleId: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSale() {
      await Promise.resolve();
      const saved = window.localStorage.getItem(`atlas-sale-${params.saleId}`);
      const localSales = window.localStorage.getItem("atlas-sales");
      const sales = localSales ? (JSON.parse(localSales) as Sale[]) : initialSales;
      const nextSale = saved
        ? (JSON.parse(saved) as Sale)
        : sales.find((item) => item.id === params.saleId) ?? null;

      if (active) {
        setSale(nextSale);
        setLoading(false);
      }
    }

    loadSale();

    return () => {
      active = false;
    };
  }, [params.saleId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-6">
        <p>Carregando nota...</p>
      </main>
    );
  }

  if (!sale) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-6">
        <p>Nota não encontrada.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-4 text-[#111] print:p-0">
      <div className="mx-auto max-w-4xl rounded-lg border border-zinc-200 bg-white p-6 print:border-0">
        <div className="mb-6 flex items-start justify-between gap-4 print:hidden">
          <div>
            <p className="text-sm text-zinc-500">Página de impressão</p>
            <h1 className="text-2xl font-semibold">{sale.number}</h1>
          </div>
          <Button onClick={() => window.print()}>Imprimir</Button>
        </div>

        <header className="border-b border-zinc-300 pb-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="text-2xl font-bold">{sale.invoiceInfo.companyName}</h2>
              <p className="text-sm text-zinc-600">{sale.invoiceInfo.address}</p>
              <p className="text-sm text-zinc-600">
                CNPJ: {sale.invoiceInfo.cnpj || "-"} | Tel: {sale.invoiceInfo.phone || "-"}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-semibold">Nota {sale.number}</p>
              <p className="text-sm text-zinc-600">{formatDate(sale.createdAt)}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-2 border-b border-zinc-300 py-5 text-sm">
          <p><strong>Cliente:</strong> {sale.invoiceInfo.client}</p>
          <p><strong>Observações:</strong> {sale.invoiceInfo.observations || "-"}</p>
        </section>

        <section className="py-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Unitário</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{number.format(item.quantity)}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">{money.format(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{money.format(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <footer className="flex justify-end border-t border-zinc-300 pt-5">
          <div className="w-full max-w-xs space-y-2 text-right">
            <p className="text-sm text-zinc-600">Total da nota</p>
            <p className="text-3xl font-bold">{money.format(sale.total)}</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
