"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { initialMovements, initialProducts, initialSales } from "@/lib/mock-data";
import {
  addStockMovement,
  removeProduct as removeFirestoreProduct,
  saveFinalizedSale,
  saveProduct as saveFirestoreProduct,
  subscribeMovements,
  subscribeProducts,
  subscribeSales,
} from "@/services/atlas-repository";
import { hasFirebaseConfig } from "@/services/firebase";
import type { InvoiceInfo, Product, Sale, SaleItem, StockMovement } from "@/types";

const productKey = "atlas-products";
const salesKey = "atlas-sales";
const movementKey = "atlas-movements";

function readLocal<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function useAtlasStore() {
  const [products, setProducts] = useState<Product[]>(() =>
    readLocal(productKey, initialProducts),
  );
  const [sales, setSales] = useState<Sale[]>(() =>
    readLocal(salesKey, initialSales),
  );
  const [movements, setMovements] = useState<StockMovement[]>(() =>
    readLocal(movementKey, initialMovements),
  );
  const [loading] = useState(false);
  const firebaseEnabled = hasFirebaseConfig();

  useEffect(() => {
    const unsubs = [
      subscribeProducts(setProducts),
      subscribeSales(setSales),
      subscribeMovements(setMovements),
    ].filter(Boolean);

    return () => unsubs.forEach((unsubscribe) => unsubscribe?.());
  }, []);

  useEffect(() => {
    if (!loading) window.localStorage.setItem(productKey, JSON.stringify(products));
  }, [products, loading]);

  useEffect(() => {
    if (!loading) window.localStorage.setItem(salesKey, JSON.stringify(sales));
  }, [sales, loading]);

  useEffect(() => {
    if (!loading) window.localStorage.setItem(movementKey, JSON.stringify(movements));
  }, [movements, loading]);

  const lowStock = useMemo(
    () => products.filter((product) => product.stockQuantity <= product.lowStockAlert),
    [products],
  );

  async function upsertProduct(input: Omit<Product, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
    const now = new Date().toISOString();
    const existing = products.find((product) => product.id === input.id);
    const product: Product = {
      ...input,
      id: input.id ?? uid("product"),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    setProducts((current) =>
      existing
        ? current.map((item) => (item.id === product.id ? product : item))
        : [product, ...current],
    );
    await saveFirestoreProduct(product);
    toast.success(existing ? "Produto atualizado." : "Produto criado.");
  }

  async function removeProduct(productId: string) {
    setProducts((current) => current.filter((product) => product.id !== productId));
    await removeFirestoreProduct(productId);
    toast.success("Produto excluído.");
  }

  async function registerMovement(
    productId: string,
    type: "entrada" | "saida" | "ajuste",
    quantity: number,
    note?: string,
  ) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const nextQuantity =
      type === "entrada"
        ? product.stockQuantity + quantity
        : type === "saida"
          ? product.stockQuantity - quantity
          : quantity;

    if (nextQuantity < 0) {
      toast.error("Estoque negativo não permitido.");
      return;
    }

    const updated: Product = {
      ...product,
      stockQuantity: nextQuantity,
      updatedAt: new Date().toISOString(),
    };
    const movement: StockMovement = {
      id: uid("movement"),
      productId,
      productName: product.name,
      type,
      quantity: type === "ajuste" ? Math.abs(nextQuantity - product.stockQuantity) : quantity,
      previousQuantity: product.stockQuantity,
      newQuantity: nextQuantity,
      note,
      createdAt: new Date().toISOString(),
    };

    setProducts((current) =>
      current.map((item) => (item.id === productId ? updated : item)),
    );
    setMovements((current) => [movement, ...current]);
    await Promise.all([saveFirestoreProduct(updated), addStockMovement(movement)]);
    toast.success("Movimentação registrada.");
  }

  async function finalizeSale(items: SaleItem[], invoiceInfo: InvoiceInfo) {
    if (!items.length) {
      toast.error("Adicione produtos antes de finalizar.");
      return null;
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product || product.stockQuantity < item.quantity) {
        toast.error(`Estoque insuficiente para ${item.productName}.`);
        return null;
      }
    }

    const createdAt = new Date().toISOString();
    const sale: Sale = {
      id: uid("sale"),
      number: `AE-${String(sales.length + 1025).padStart(4, "0")}`,
      items,
      total: items.reduce((total, item) => total + item.total, 0),
      invoiceInfo,
      finalized: true,
      createdAt,
    };

    const updatedProducts = products.map((product) => {
      const item = items.find((saleItem) => saleItem.productId === product.id);
      if (!item) return product;
      return {
        ...product,
        stockQuantity: product.stockQuantity - item.quantity,
        updatedAt: createdAt,
      };
    });

    const saleMovements: StockMovement[] = items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        id: uid("movement"),
        productId: item.productId,
        productName: item.productName,
        type: "venda",
        quantity: item.quantity,
        previousQuantity: product.stockQuantity,
        newQuantity: product.stockQuantity - item.quantity,
        note: `Venda ${sale.number}`,
        createdAt,
      };
    });

    setProducts(updatedProducts);
    setSales((current) => [sale, ...current]);
    setMovements((current) => [...saleMovements, ...current]);
    window.localStorage.setItem(`atlas-sale-${sale.id}`, JSON.stringify(sale));
    await saveFinalizedSale(sale, updatedProducts, saleMovements);
    toast.success("Nota finalizada e estoque atualizado.");
    return sale;
  }

  return {
    products,
    sales,
    movements,
    lowStock,
    loading,
    firebaseEnabled,
    upsertProduct,
    removeProduct,
    registerMovement,
    finalizeSale,
  };
}
