import { MessageSender } from "./MessageSender";

export interface MessageData {
  content: string;
  sender: MessageSender;
  timestamp: number;
}
