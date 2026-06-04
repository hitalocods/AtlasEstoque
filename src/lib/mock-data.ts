import type { Product, Sale, StockMovement } from "@/types";

const now = new Date();
const iso = (daysAgo: number) =>
  new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const initialProducts: Product[] = [
  {
    id: "p-1",
    name: "Banana Nanica",
    category: "Frutas",
    unit: "kg",
    stockQuantity: 180,
    costPrice: 3.4,
    salePrice: 5.9,
    lowStockAlert: 40,
    createdAt: iso(14),
    updatedAt: iso(1),
  },
  {
    id: "p-2",
    name: "Tomate Italiano",
    category: "Legumes",
    unit: "cx",
    stockQuantity: 22,
    costPrice: 58,
    salePrice: 82,
    lowStockAlert: 10,
    createdAt: iso(12),
    updatedAt: iso(0),
  },
  {
    id: "p-3",
    name: "Alface Crespa",
    category: "Folhagens",
    unit: "un",
    stockQuantity: 34,
    costPrice: 1.6,
    salePrice: 3.2,
    lowStockAlert: 50,
    createdAt: iso(9),
    updatedAt: iso(0),
  },
  {
    id: "p-4",
    name: "Maçã Fuji",
    category: "Frutas",
    unit: "kg",
    stockQuantity: 96,
    costPrice: 6.9,
    salePrice: 10.5,
    lowStockAlert: 30,
    createdAt: iso(8),
    updatedAt: iso(2),
  },
  {
    id: "p-5",
    name: "Cenoura",
    category: "Verduras",
    unit: "kg",
    stockQuantity: 18,
    costPrice: 2.8,
    salePrice: 4.7,
    lowStockAlert: 25,
    createdAt: iso(5),
    updatedAt: iso(0),
  },
];

export const initialSales: Sale[] = [
  {
    id: "s-1",
    number: "AE-1024",
    items: [
      {
        productId: "p-1",
        productName: "Banana Nanica",
        unit: "kg",
        quantity: 18,
        unitPrice: 5.9,
        total: 106.2,
      },
      {
        productId: "p-2",
        productName: "Tomate Italiano",
        unit: "cx",
        quantity: 2,
        unitPrice: 82,
        total: 164,
      },
    ],
    total: 270.2,
    invoiceInfo: {
      companyName: "Atlas Estoque",
      cnpj: "00.000.000/0001-00",
      phone: "(11) 0000-0000",
      address: "CEASA",
      client: "Mercado Central",
      observations: "Entrega retirada no box.",
    },
    finalized: true,
    createdAt: iso(0),
  },
];

export const initialMovements: StockMovement[] = [
  {
    id: "m-1",
    productId: "p-2",
    productName: "Tomate Italiano",
    type: "entrada",
    quantity: 12,
    previousQuantity: 10,
    newQuantity: 22,
    note: "Entrada manual",
    createdAt: iso(0),
  },
  {
    id: "m-2",
    productId: "p-3",
    productName: "Alface Crespa",
    type: "ajuste",
    quantity: 8,
    previousQuantity: 42,
    newQuantity: 34,
    note: "Ajuste por conferência",
    createdAt: iso(0),
  },
  {
    id: "m-3",
    productId: "p-1",
    productName: "Banana Nanica",
    type: "venda",
    quantity: 18,
    previousQuantity: 198,
    newQuantity: 180,
    note: "Venda AE-1024",
    createdAt: iso(0),
  },
];

