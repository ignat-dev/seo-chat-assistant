import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import Fastify from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import { firebaseApp } from './firebase/firebaseApp';
import { ServerRequest } from './types/ServerRequest';
import { ServerReply } from './types/ServerReply';

const server = Fastify();

server.register(fastifyCors);
server.register(fastifyJwt, { secret: `${process.env.SERVER_JWT_SECRET}` });

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

export default server;
