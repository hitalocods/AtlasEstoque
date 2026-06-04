"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSaleById } from "@/services/atlas-repository";
import { formatDate, money, number } from "@/lib/format";
import { initialSales } from "@/lib/mock-data";
import type { Sale } from "@/types";

export default function PrintPage() {
  const params = useParams<{ saleId: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSale() {
      await Promise.resolve();
      const firestoreSale = await getSaleById(params.saleId);
      if (firestoreSale) {
        if (active) {
          setSale(firestoreSale);
          setLoading(false);
        }
        return;
      }
      const saved = window.localStorage.getItem(`atlas-sale-${params.saleId}`);
      const localSales = window.localStorage.getItem("atlas-sales");
      const sales = localSales
        ? (JSON.parse(localSales) as Sale[])
        : initialSales;
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
        <p>Carregando comprovante...</p>
      </main>
    );
  }

  if (!sale) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-6">
        <p>Comprovante nao encontrado.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-4 text-[#111] print:p-0">
      <div className="mx-auto max-w-4xl rounded-lg border border-zinc-200 bg-white p-6 print:border-0">
        <div className="mb-6 flex items-start justify-between gap-4 print:hidden">
          <div>
            <p className="text-sm text-zinc-500">Pagina de impressao</p>
            <h1 className="text-2xl font-semibold">
              Comprovante de Venda / Romaneio
            </h1>
            <p className="text-sm text-zinc-600">{sale.number}</p>
          </div>
          <Button onClick={() => window.print()}>Imprimir</Button>
        </div>

        <header className="border-b border-zinc-300 pb-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Documento interno
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                Comprovante de Venda / Romaneio
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-semibold">{sale.number}</p>
              <p className="text-sm text-zinc-600">
                {formatDate(sale.createdAt)}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 border-b border-zinc-300 py-5 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Emitente
            </p>
            <p className="font-semibold">
              {sale.invoiceInfo.companyName || "-"}
            </p>
            <p className="text-zinc-600">CNPJ: {sale.invoiceInfo.cnpj || "-"}</p>
            <p className="text-zinc-600">
              Telefone: {sale.invoiceInfo.phone || "-"}
            </p>
            <p className="text-zinc-600">
              Endereco: {sale.invoiceInfo.address || "-"}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Destinatario
            </p>
            <p className="font-semibold">{sale.invoiceInfo.client || "-"}</p>
            <p className="text-zinc-600">
              CNPJ/CPF: {sale.invoiceInfo.clientDocument || "-"}
            </p>
            <p className="text-zinc-600">
              Telefone: {sale.invoiceInfo.clientPhone || "-"}
            </p>
            <p className="text-zinc-600">
              Endereco: {sale.invoiceInfo.clientAddress || "-"}
            </p>
          </div>
        </section>

        <section className="border-b border-zinc-300 py-4 text-sm">
          <p>
            <strong>Observacoes:</strong>{" "}
            {sale.invoiceInfo.observations || "-"}
          </p>
        </section>

        <section className="py-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Unitario</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{number.format(item.quantity)}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">
                    {money.format(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {money.format(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <footer className="flex justify-end border-t border-zinc-300 pt-5">
          <div className="w-full max-w-xs space-y-2 text-right">
            <p className="text-sm text-zinc-600">Total do comprovante</p>
            <p className="text-3xl font-bold">{money.format(sale.total)}</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
