import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const prompt = ChatPromptTemplate.fromTemplate(`
  You are an SEO assistant. Given a page title and content, suggest:
  - An improved page title
  - A concise meta description
  - Suggested improvements to the content

  Page Title: {title}
  Page Content: {content}
`);

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4",
  temperature: 0.7,
});

const chain = prompt.pipe(model);

export async function getSeoRecommendations(title: string, content: string): Promise<string> {
  const response = await chain.invoke({ title, content });

  return response.text;
}
