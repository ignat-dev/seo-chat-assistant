import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  mapChatMessagesToStoredMessages,
  SystemMessage,
} from "@langchain/core/messages";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export class SmartMemory extends BaseListChatMessageHistory {
  private static readonly SUMMARY_BATCH_SIZE = 10;

  private summarizedCount = 0;
  private summary = "";
  private summaryModel: ChatOpenAI;
  private userInput = "";
  private vectorStore: MemoryVectorStore;

  public lc_namespace: string[];

  constructor(
    private history: BaseListChatMessageHistory,
    apiKey: string,
    private shortTermCount: number = 5,
    private relevantCount: number = 5,
  ) {
    super();
    this.lc_namespace = this.history.lc_namespace;
    this.summaryModel = new ChatOpenAI({ apiKey, model: "gpt-4o-mini", temperature: 0 });
    this.vectorStore = new MemoryVectorStore(new OpenAIEmbeddings({ apiKey }));
  }

  async addMessage(message: BaseMessage): Promise<void> {
    // Add to chronological store.
    await this.history.addMessage(message);

    // Add to vector store.
    await this.vectorStore.addDocuments([{
      metadata: { role: message.getType() },
      pageContent: message.content.toString(),
    }]);

    // Update user input to use it as a query for relevant messages.
    if (message.getType() === "human") {
      const [storedMessage] = mapChatMessagesToStoredMessages([message]);

      this.userInput = storedMessage.data.content;
    }

    // Update summary to prevent chat history from getting too large.
    this.updateConversationSummary();
  }

  async getMessages(): Promise<Array<BaseMessage>> {
    const messages = await this.history.getMessages();

    // Last N messages (short-term).
    const shortTermMessages = messages.slice(-this.shortTermCount);

    // Relevant old messages.
    const relevantMessages = await this.getRelevantMessages();

    // Summary as a synthetic system message.
    const summaryMessages =
      this.summary.length > 0
        ? [new SystemMessage(`Conversation summary:\n${this.summary}`)]
        : [];

    return [
      ...summaryMessages,
      ...relevantMessages,
      ...shortTermMessages,
    ];
  }

  private async getRelevantMessages(): Promise<Array<BaseMessage>> {
    const relevantDocs = (
      this.userInput
        ? await this.vectorStore.similaritySearch(this.userInput, this.relevantCount)
        : []
    );

    return relevantDocs.map(({ metadata, pageContent }) =>
      metadata.role === "human" ? new HumanMessage(pageContent) : new AIMessage(pageContent)
    );
  }

  private async updateConversationSummary() {
    // TODO: Get only relevant part of the messages.
    const messages = await this.history.getMessages();
    const threshold = this.summarizedCount + this.shortTermCount + SmartMemory.SUMMARY_BATCH_SIZE;

    if (messages.length < threshold) {
      return;
    }

    const newMessages = messages.slice(this.summarizedCount, -this.shortTermCount);

    const prompt = `
      Summarize the following chat history in a concise way that preserves
      all important facts and decisions:

      ${this.summary ? `- [AI]: Conversation summary so far: ${this.summary}\n` : ""}
      ${newMessages.map((x) => `- [${x.getType().toUpperCase()}]: ${x.content}`).join("\n")}
    `;

    const result = await this.summaryModel.invoke([new HumanMessage(prompt)]);

    this.summary = result.content.toString();
    this.summarizedCount += newMessages.length;
  }
}
