import { getFirestore } from "firebase-admin/firestore";
import { firebaseApp } from "./firebaseApp";

export const firestore = getFirestore(firebaseApp);
