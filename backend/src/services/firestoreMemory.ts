import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import {
  BaseMessage,
  mapStoredMessagesToChatMessages,
  StoredMessage,
  mapChatMessagesToStoredMessages,
} from "@langchain/core/messages";
import { DbCollection } from "../common/constants";
import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
} from "firebase-admin/firestore";
import { MessageSender } from "../types";

interface FirestoreMemoryInit {
  collectionName?: string;
  firestore: Firestore;
  sessionId: string;
}

export class FirestoreMemory extends BaseListChatMessageHistory {
  private collectionName: string;
  private document: DocumentReference<DocumentData>;
  private firestore: Firestore;
  private sessionId: string;

  public lc_namespace = ["langchain", "stores", "message", "firestore"];

  constructor({
    collectionName = DbCollection.Users,
    firestore,
    sessionId,
  }: FirestoreMemoryInit) {
    super();
    this.collectionName = collectionName;
    this.firestore = firestore;
    this.sessionId = sessionId;
    this.document = this.firestore.collection(this.collectionName).doc(this.sessionId);
  }

  async addMessage(message: BaseMessage): Promise<void> {
    const [storedMessage] = mapChatMessagesToStoredMessages([message]);

    this.getCollection().add({
      content: storedMessage.data.content,
      sender: this.messageTypeToSender(storedMessage.type),
      timestamp: Date.now(),
    });
  }

  async getMessages(): Promise<BaseMessage[]> {
    const querySnapshot = await this.getCollection().orderBy("timestamp", "asc").get();
    const response: Array<StoredMessage> = querySnapshot.docs.map((doc) => {
      const { sender, content } = doc.data();

      return { data: content, type: this.senderToMessageType(sender) };
    });

    return mapStoredMessagesToChatMessages(response);
  }

  async clear(): Promise<void> {
    await this.document.collection(DbCollection.Messages).get().then((querySnapshot) =>
      querySnapshot.docs.forEach((snapshot) => snapshot.ref.delete())
    );
  }

  private getCollection(): CollectionReference {
    return this.document.collection(DbCollection.Messages);
  }

  private messageTypeToSender(messageType: string): MessageSender {
    switch (messageType) {
      case 'human':
        return MessageSender.USER;

      default:
        return MessageSender.AI;
    }
  }

  private senderToMessageType(sender: string): string {
    switch (sender) {
      case MessageSender.USER:
        return 'human';

      default:
        return sender;
    }
  }
}
