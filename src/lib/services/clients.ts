import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Client } from "@/components/clients/mock-data";

const COL = "clients";

export async function getClients(): Promise<Client[]> {
  const q = query(collection(db, COL), orderBy("registeredAtTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Client));
}

export async function addClient(data: Omit<Client, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    registeredAtTs: serverTimestamp(),
  });
  return ref.id;
}

export async function updateClient(id: string, data: Partial<Client>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data });
}

export async function deleteClient(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
