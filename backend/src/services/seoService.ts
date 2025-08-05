import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";

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
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

// Message history store (could be per user/session).
const sessionHistoryMap = new Map<string, InMemoryChatMessageHistory>();

function getMessageHistory(sessionId: string): InMemoryChatMessageHistory {
  if (!sessionHistoryMap.has(sessionId)) {
    sessionHistoryMap.set(sessionId, new InMemoryChatMessageHistory());
  }

  return sessionHistoryMap.get(sessionId)!;
}

const chain = new RunnableWithMessageHistory({
  runnable: prompt.pipe(model),
  getMessageHistory,
  historyMessagesKey: "history",
  inputMessagesKey: "input",
});


export async function getSeoRecommendations(input: string, sessionId: string): Promise<string> {
  const response = await chain.invoke(
    { input },
    { configurable: { sessionId } },
  );

  return response.text.trim();
}
