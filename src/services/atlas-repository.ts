import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  getDoc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import type {
  CompanySettings,
  Employee,
  Product,
  Sale,
  StockMovement,
  Vehicle,
  VehicleLoad,
} from "@/types";
import { getFirebaseDb } from "@/services/firebase";

const collections = {
  users: "users",
  products: "products",
  sales: "sales",
  stockMovements: "stock_movements",
  companySettings: "company_settings",
  vehicles: "vehicles",
  employees: "employees",
  vehicleLoads: "vehicle_loads",
};

export function subscribeProducts(callback: (products: Product[]) => void) {
  const db = getFirebaseDb();
  if (!db) return null;

  const q = query(collection(db, collections.products), orderBy("name", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product));
  });
}

export function subscribeSales(callback: (sales: Sale[]) => void) {
  const db = getFirebaseDb();
  if (!db) return null;

  const q = query(collection(db, collections.sales), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Sale));
  });
}

export function subscribeMovements(callback: (movements: StockMovement[]) => void) {
  const db = getFirebaseDb();
  if (!db) return null;

  const q = query(
    collection(db, collections.stockMovements),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as StockMovement),
    );
  });
}

export function subscribeVehicles(callback: (vehicles: Vehicle[]) => void) {
  const db = getFirebaseDb();
  if (!db) return null;

  const q = query(collection(db, collections.vehicles), orderBy("plate", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Vehicle));
  });
}

export function subscribeEmployees(callback: (employees: Employee[]) => void) {
  const db = getFirebaseDb();
  if (!db) return null;

  const q = query(collection(db, collections.employees), orderBy("name", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Employee));
  });
}

export function subscribeVehicleLoads(callback: (loads: VehicleLoad[]) => void) {
  const db = getFirebaseDb();
  if (!db) return null;

  const q = query(collection(db, collections.vehicleLoads), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as VehicleLoad));
  });
}

export function subscribeCompanySettings(callback: (settings: CompanySettings) => void) {
  const db = getFirebaseDb();
  if (!db) return null;

  return onSnapshot(doc(db, collections.companySettings, "default"), (snapshot) => {
    if (snapshot.exists()) callback(snapshot.data() as CompanySettings);
  });
}

export async function saveProduct(product: Product) {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, collections.products, product.id), product);
}

export async function removeProduct(productId: string) {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, collections.products, productId));
}

export async function updateProductStock(productId: string, quantity: number) {
  const db = getFirebaseDb();
  if (!db) return;
  await updateDoc(doc(db, collections.products, productId), {
    stockQuantity: quantity,
    updatedAt: new Date().toISOString(),
  });
}

export async function addStockMovement(movement: StockMovement) {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, collections.stockMovements, movement.id), movement);
}

export async function saveCompanySettings(settings: CompanySettings) {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, collections.companySettings, "default"), settings);
}

export async function saveVehicle(vehicle: Vehicle) {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, collections.vehicles, vehicle.id), vehicle);
}

export async function removeVehicle(vehicleId: string) {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, collections.vehicles, vehicleId));
}

export async function saveEmployee(employee: Employee) {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, collections.employees, employee.id), employee);
}

export async function removeEmployee(employeeId: string) {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, collections.employees, employeeId));
}

export async function saveVehicleLoad(load: VehicleLoad) {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, collections.vehicleLoads, load.id), load);
}

export async function getSaleById(saleId: string) {
  const db = getFirebaseDb();
  if (!db) return null;
  const snapshot = await getDoc(doc(db, collections.sales, saleId));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Sale) : null;
}

export async function saveFinalizedSale(
  sale: Sale,
  products: Product[],
  movements: StockMovement[],
) {
  const db = getFirebaseDb();
  if (!db) return;

  const batch = writeBatch(db);
  batch.set(doc(db, collections.sales, sale.id), sale);
  products.forEach((product) => {
    batch.set(doc(db, collections.products, product.id), product);
  });
  movements.forEach((movement) => {
    batch.set(doc(db, collections.stockMovements, movement.id), movement);
  });
  await batch.commit();
}

export async function createUserRecord(uid: string, email: string | null) {
  const db = getFirebaseDb();
  if (!db) return;
  await addDoc(collection(db, collections.users), {
    uid,
    email,
    createdAt: new Date().toISOString(),
  });
}

export type FirestoreUnsubscribe = Unsubscribe | null;
