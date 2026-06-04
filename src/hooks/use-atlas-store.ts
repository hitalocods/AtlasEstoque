"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { initialMovements, initialProducts, initialSales } from "@/lib/mock-data";
import {
  addStockMovement,
  removeEmployee as removeFirestoreEmployee,
  removeProduct as removeFirestoreProduct,
  removeVehicle as removeFirestoreVehicle,
  saveFinalizedSale,
  saveEmployee as saveFirestoreEmployee,
  saveProduct as saveFirestoreProduct,
  saveVehicle as saveFirestoreVehicle,
  saveVehicleLoad as saveFirestoreVehicleLoad,
  subscribeEmployees,
  subscribeMovements,
  subscribeProducts,
  subscribeSales,
  subscribeVehicleLoads,
  subscribeVehicles,
} from "@/services/atlas-repository";
import { hasFirebaseConfig } from "@/services/firebase";
import type {
  Employee,
  InvoiceInfo,
  Product,
  Sale,
  SaleItem,
  StockMovement,
  Vehicle,
  VehicleLoad,
} from "@/types";

const productKey = "atlas-products";
const salesKey = "atlas-sales";
const movementKey = "atlas-movements";
const vehicleKey = "atlas-vehicles";
const employeeKey = "atlas-employees";
const loadKey = "atlas-vehicle-loads";

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
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    readLocal(vehicleKey, []),
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    readLocal(employeeKey, []),
  );
  const [vehicleLoads, setVehicleLoads] = useState<VehicleLoad[]>(() =>
    readLocal(loadKey, []),
  );
  const [loading] = useState(false);
  const firebaseEnabled = hasFirebaseConfig();

  useEffect(() => {
    const unsubs = [
      subscribeProducts(setProducts),
      subscribeSales(setSales),
      subscribeMovements(setMovements),
      subscribeVehicles(setVehicles),
      subscribeEmployees(setEmployees),
      subscribeVehicleLoads(setVehicleLoads),
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

  useEffect(() => {
    if (!loading) window.localStorage.setItem(vehicleKey, JSON.stringify(vehicles));
  }, [vehicles, loading]);

  useEffect(() => {
    if (!loading) window.localStorage.setItem(employeeKey, JSON.stringify(employees));
  }, [employees, loading]);

  useEffect(() => {
    if (!loading) window.localStorage.setItem(loadKey, JSON.stringify(vehicleLoads));
  }, [vehicleLoads, loading]);

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

  async function upsertVehicle(input: Omit<Vehicle, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
    const now = new Date().toISOString();
    const existing = vehicles.find((vehicle) => vehicle.id === input.id);
    const vehicle: Vehicle = {
      ...input,
      plate: input.plate.trim().toUpperCase(),
      id: input.id ?? uid("vehicle"),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (!vehicle.plate || !vehicle.model.trim()) {
      toast.error("Informe placa e modelo do veículo.");
      return;
    }

    setVehicles((current) =>
      existing
        ? current.map((item) => (item.id === vehicle.id ? vehicle : item))
        : [vehicle, ...current],
    );
    await saveFirestoreVehicle(vehicle);
    toast.success(existing ? "Veículo atualizado." : "Veículo cadastrado.");
  }

  async function removeVehicle(vehicleId: string) {
    setVehicles((current) => current.filter((vehicle) => vehicle.id !== vehicleId));
    await removeFirestoreVehicle(vehicleId);
    toast.success("Veículo removido.");
  }

  async function upsertEmployee(input: Omit<Employee, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
    const now = new Date().toISOString();
    const existing = employees.find((employee) => employee.id === input.id);
    const employee: Employee = {
      ...input,
      id: input.id ?? uid("employee"),
      active: input.active ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (!employee.name.trim()) {
      toast.error("Informe o nome do funcionário.");
      return;
    }

    setEmployees((current) =>
      existing
        ? current.map((item) => (item.id === employee.id ? employee : item))
        : [employee, ...current],
    );
    await saveFirestoreEmployee(employee);
    toast.success(existing ? "Funcionário atualizado." : "Funcionário cadastrado.");
  }

  async function removeEmployee(employeeId: string) {
    setEmployees((current) => current.filter((employee) => employee.id !== employeeId));
    await removeFirestoreEmployee(employeeId);
    toast.success("Funcionário removido.");
  }

  async function assignVehicle(vehicleId: string, employeeId: string) {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    const employee = employees.find((item) => item.id === employeeId);
    if (!vehicle || !employee) return;

    const updated: Vehicle = {
      ...vehicle,
      activeEmployeeId: employee.id,
      activeEmployeeName: employee.name,
      updatedAt: new Date().toISOString(),
    };

    setVehicles((current) =>
      current.map((item) => (item.id === vehicleId ? updated : item)),
    );
    await saveFirestoreVehicle(updated);
    toast.success("Veículo associado ao funcionário.");
  }

  async function createVehicleLoad(input: {
    vehicleId: string;
    employeeId: string;
    saleId?: string;
    description: string;
  }) {
    const vehicle = vehicles.find((item) => item.id === input.vehicleId);
    const employee = employees.find((item) => item.id === input.employeeId);
    const sale = input.saleId
      ? sales.find((item) => item.id === input.saleId)
      : undefined;
    if (!vehicle || !employee) {
      toast.error("Selecione veículo e funcionário.");
      return;
    }

    const load: VehicleLoad = {
      id: uid("load"),
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plate,
      employeeId: employee.id,
      employeeName: employee.name,
      saleId: sale?.id,
      saleNumber: sale?.number,
      description: input.description,
      status: "aberta",
      createdAt: new Date().toISOString(),
    };

    setVehicleLoads((current) => [load, ...current]);
    await saveFirestoreVehicleLoad(load);
    toast.success("Carga registrada no veículo.");
  }

  async function closeVehicleLoad(loadId: string) {
    const load = vehicleLoads.find((item) => item.id === loadId);
    if (!load) return;
    const updated: VehicleLoad = {
      ...load,
      status: "finalizada",
      closedAt: new Date().toISOString(),
    };
    setVehicleLoads((current) =>
      current.map((item) => (item.id === loadId ? updated : item)),
    );
    await saveFirestoreVehicleLoad(updated);
    toast.success("Carga finalizada.");
  }

  async function finalizeSale(
    items: SaleItem[],
    invoiceInfo: InvoiceInfo,
    operation?: { vehicleId?: string; employeeId?: string },
  ) {
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
      vehicleId: operation?.vehicleId,
      vehiclePlate: vehicles.find((vehicle) => vehicle.id === operation?.vehicleId)?.plate,
      employeeId: operation?.employeeId,
      employeeName: employees.find((employee) => employee.id === operation?.employeeId)?.name,
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
    toast.success("Comprovante finalizado e estoque atualizado.");
    return sale;
  }

  return {
    products,
    sales,
    movements,
    vehicles,
    employees,
    vehicleLoads,
    lowStock,
    loading,
    firebaseEnabled,
    upsertProduct,
    removeProduct,
    registerMovement,
    upsertVehicle,
    removeVehicle,
    upsertEmployee,
    removeEmployee,
    assignVehicle,
    createVehicleLoad,
    closeVehicleLoad,
    finalizeSale,
  };
}
