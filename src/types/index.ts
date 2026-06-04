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
  clientDocument?: string;
  clientPhone?: string;
  clientAddress?: string;
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
  vehicleId?: string;
  vehiclePlate?: string;
  employeeId?: string;
  employeeName?: string;
  finalized: boolean;
  createdAt: string;
};

export type AppUser = {
  uid: string;
  email: string | null;
};

export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  notes?: string;
  activeEmployeeId?: string;
  activeEmployeeName?: string;
  createdAt: string;
  updatedAt: string;
};

export type Employee = {
  id: string;
  name: string;
  phone: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VehicleLoadStatus = "aberta" | "finalizada";

export type VehicleLoad = {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  employeeId: string;
  employeeName: string;
  saleId?: string;
  saleNumber?: string;
  description: string;
  status: VehicleLoadStatus;
  createdAt: string;
  closedAt?: string;
};
