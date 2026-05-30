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
import { Case } from "@/components/cases/mock-data";

const COL = "cases";

export async function getCases(): Promise<Case[]> {
  const q = query(collection(db, COL), orderBy("createdAtTs", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Case));
}

export async function addCase(data: Omit<Case, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAtTs: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCase(id: string, data: Partial<Case>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data });
}

export async function deleteCase(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
