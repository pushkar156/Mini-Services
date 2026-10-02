import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type ServiceType =
  | "voice"
  | "humanizer"
  | "ductus"
  | "ident"
  | "mediadrop"
  | "photonarrator";

export interface HistoryItem {
  id?: string;
  userId: string;
  service: ServiceType;
  title: string;
  summary: string;
  payload: Record<string, any>;
  createdAt?: Timestamp | any;
}

/**
 * Save a new generation/result to user's Firestore history
 */
export async function saveHistoryItem(
  userId: string,
  service: ServiceType,
  title: string,
  summary: string,
  payload: Record<string, any>
): Promise<string> {
  if (!userId) {
    throw new Error("User must be authenticated to save history.");
  }

  const historyCollection = collection(db, "users", userId, "history");
  const docRef = await addDoc(historyCollection, {
    userId,
    service,
    title: title.slice(0, 100),
    summary: summary.slice(0, 300),
    payload,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Fetch history items with optional service filtering
 */
export async function fetchUserHistory(
  userId: string,
  serviceFilter?: ServiceType,
  maxItems: number = 50
): Promise<HistoryItem[]> {
  if (!userId) return [];

  const historyCollection = collection(db, "users", userId, "history");
  let q = query(historyCollection, orderBy("createdAt", "desc"), limit(maxItems));

  if (serviceFilter) {
    q = query(
      historyCollection,
      where("service", "==", serviceFilter),
      orderBy("createdAt", "desc"),
      limit(maxItems)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<HistoryItem, "id">),
  }));
}

/**
 * Real-time subscription to user's history
 */
export function subscribeToUserHistory(
  userId: string,
  onUpdate: (items: HistoryItem[]) => void,
  serviceFilter?: ServiceType,
  maxItems: number = 50
) {
  if (!userId) return () => {};

  const historyCollection = collection(db, "users", userId, "history");
  let q = query(historyCollection, orderBy("createdAt", "desc"), limit(maxItems));

  if (serviceFilter) {
    q = query(
      historyCollection,
      where("service", "==", serviceFilter),
      orderBy("createdAt", "desc"),
      limit(maxItems)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<HistoryItem, "id">),
    }));
    onUpdate(items);
  });
}

/**
 * Delete a specific history item
 */
export async function removeHistoryItem(userId: string, itemId: string): Promise<void> {
  if (!userId || !itemId) return;
  const docRef = doc(db, "users", userId, "history", itemId);
  await deleteDoc(docRef);
}
