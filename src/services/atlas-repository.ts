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
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import type { Product, Sale, StockMovement } from "@/types";
import { getFirebaseDb } from "@/services/firebase";

const collections = {
  users: "users",
  products: "products",
  sales: "sales",
  stockMovements: "stock_movements",
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

