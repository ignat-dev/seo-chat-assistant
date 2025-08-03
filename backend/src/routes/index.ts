import { FastifyInstance } from 'fastify';
import { saveMessage, getMessages } from '../services/firestoreService';
import { getSeoRecommendations } from '../services/seoService';
import { MessageSender } from '../types/MessageSender';
import { ServerRequest } from '../types/ServerRequest';

export default async function routes(server: FastifyInstance) {
  server.get('/messages/:chatId', async (request: ServerRequest) => {
    const userId = request.user.uid;
    const messages = await getMessages(userId);

    return { messages };
  });

  server.post('/messages', async (request: ServerRequest) => {
    const userId = request.user.uid;
    const { title, content } = request.body;

    await saveMessage(userId, {
      content: `Title: \${title}\nContent: \${content}`,
      sender: MessageSender.USER,
      timestamp: Date.now(),
    });

    const response = await getSeoRecommendations(title, content);

    await saveMessage(userId, {
      content: response,
      sender: MessageSender.AI,
      timestamp: Date.now(),
    });

    return { response };
  });
}
