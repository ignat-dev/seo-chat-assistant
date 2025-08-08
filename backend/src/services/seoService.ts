import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { firestore } from "../firebase/firestore";
import { FirestoreMemory } from "./firestoreMemory";

const HISTORY_MESSAGES_KEY = "history";
const INPUT_MESSAGES_KEY = "input";

const systemPrompt = `
  You are an SEO optimization assistant. The user will give you free text. Your tasks:
    1. Try to detect a "page title" and "page content" from the conversation.
    2. If either is missing, ask the user to provide the missing part — conversationally.
    3. Once both are available, respond with:
      - Improved page title
      - Suggested meta description
      - Suggested improvements to the content
  Always keep the interaction friendly and in a chat style.
`;

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.7,
});

const prompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(systemPrompt),
  new MessagesPlaceholder(HISTORY_MESSAGES_KEY),
  HumanMessagePromptTemplate.fromTemplate(`{${INPUT_MESSAGES_KEY}}`),
]);

const chain = new RunnableWithMessageHistory({
  runnable: prompt.pipe(model),
  getMessageHistory: (sessionId) => new FirestoreMemory({ firestore, sessionId }),
  historyMessagesKey: HISTORY_MESSAGES_KEY,
  inputMessagesKey: INPUT_MESSAGES_KEY,
});


export async function getSeoRecommendations(input: string, sessionId: string): Promise<string> {
  const response = await chain.invoke(
    { input },
    { configurable: { sessionId } },
  );

  return response.text.trim();
}
