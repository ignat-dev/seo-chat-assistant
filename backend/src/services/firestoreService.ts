import { CollectionReference } from "firebase-admin/firestore";
import { firestore as db } from "../firebase/firestore";
import { Message } from "../types/Message";
import { MessageData } from "../types/MessageData";

export async function getMessages(userId: string): Promise<Array<Message>> {
  const snapshot = await getMessagesCollectionForUser(userId).orderBy("timestamp").get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as MessageData) }));
}

export async function saveMessage(userId: string, data: MessageData): Promise<void> {
  const docRef = getMessagesCollectionForUser(userId).doc();

  await docRef.set(data);
}

function getMessagesCollectionForUser(userId: string): CollectionReference {
  return db.collection("users").doc(userId).collection("messages");
}
