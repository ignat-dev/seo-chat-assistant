import { FastifyInstance } from 'fastify';
import { saveMessage, getMessages } from '../services/firestoreService';
import { getSeoRecommendations } from '../services/seoService';
import { MessageSender } from '../types/MessageSender';
import { ServerReply } from '../types/ServerReply';
import { ServerRequest } from '../types/ServerRequest';

export default async function routes(server: FastifyInstance) {
  const AI_RESPONSE_DELAY = 3000;

  server.get('/messages', async (request: ServerRequest) => {
    const userId = request.user.uid;

    // Delay the response a bit to trigger loading state.
    const [messages] = await Promise.all([
      await getMessages(userId),
      delayAsyncExecution(),
    ]);

    return { messages };
  });

  server.post('/messages', async (request: ServerRequest, reply: ServerReply) => {
    const userId = request.user.uid;
    const { message } = request.body;

    if (!message) {
      return reply.code(400).send('Invalid data');
    }

    const [firstLine, ...rest] = message?.trim().split('\n');
    const title = firstLine.trim();
    const content = rest.join('\n').trim();

    await saveMessage(userId, {
      content: message,
      sender: MessageSender.USER,
      timestamp: Date.now(),
    });

    // Delay the response a bit in case the AI agent responds too quickly.
    const [response] = await Promise.all([
      getSeoRecommendations(title, content),
      delayAsyncExecution(AI_RESPONSE_DELAY),
    ]);

    await saveMessage(userId, {
      content: response,
      sender: MessageSender.AI,
      timestamp: Date.now(),
    });

    return { response };
  });
}

function delayAsyncExecution(delayInMs: number = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayInMs);
  });
}
