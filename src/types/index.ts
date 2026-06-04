export type ProductCategory =
  | "Frutas"
  | "Verduras"
  | "Legumes"
  | "Folhagens"
  | "Outros";

export type ProductUnit = "kg" | "un" | "cx" | "pct" | "dz";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  stockQuantity: number;
  costPrice: number;
  salePrice: number;
  lowStockAlert: number;
  createdAt: string;
  updatedAt: string;
};

export type StockMovementType = "entrada" | "saida" | "ajuste" | "venda";

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  createdAt: string;
};

export type SaleItem = {
  productId: string;
  productName: string;
  unit: ProductUnit;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type InvoiceInfo = {
  companyName: string;
  cnpj: string;
  phone: string;
  address: string;
  client: string;
  observations: string;
};

export type CompanySettings = {
  companyName: string;
  cnpj: string;
  phone: string;
  address: string;
};

export type Sale = {
  id: string;
  number: string;
  items: SaleItem[];
  total: number;
  invoiceInfo: InvoiceInfo;
  finalized: boolean;
  createdAt: string;
};

export type AppUser = {
  uid: string;
  email: string | null;
};
