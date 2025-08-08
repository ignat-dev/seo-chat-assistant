import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { firestore } from "../firebase/firestore";
import { getModelConfig, getSystemPrompt } from "./configurationService";
import { FirestoreMemory } from "./firestoreMemory";

const HISTORY_MESSAGES_KEY = "history";
const INPUT_MESSAGES_KEY = "input";

const systemPrompt = getSystemPrompt();

const model = new ChatOpenAI({
  ...getModelConfig(),
  apiKey: process.env.OPENAI_API_KEY,
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
