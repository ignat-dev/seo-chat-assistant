import fastifyCors from '@fastify/cors';
import Fastify from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import { firebaseApp } from './firebase/firebaseApp';
import routes from './routes';
import { ServerReply, ServerRequest } from './types';

const server = Fastify({ logger: process.env.NODE_ENV === 'development' });

server.register(fastifyCors);

server.addHook('preHandler', async (request: ServerRequest, reply: ServerReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send('Missing token');
  }

  const token = authHeader.split(' ')[1];

  try {
    request.user = await getAuth(firebaseApp).verifyIdToken(token);
  } catch {
    return reply.status(401).send('Invalid token');
  }
});

// Add prefix to routes to unify the access between local and cloud environment.
server.register(routes, { prefix: `/${process.env.GOOGLE_CLOUD_FUNCTION_NAME}` });

export default server;
