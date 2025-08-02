import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import routes from './routes';

const fastify = Fastify();
fastify.register(fastifyCors);
fastify.register(fastifyJwt, { secret: 'supersecret' });

initializeApp({ credential: applicationDefault() });

fastify.decorate('verifyFirebaseToken', async (request, reply) => {
  const authHeader = request.headers.authorization;
  if (!authHeader) return reply.status(401).send('Missing token');
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await getAuth().verifyIdToken(token);
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send('Invalid token');
  }
});

fastify.register(routes);

fastify.listen({ port: 3001 }, err => {
  if (err) throw err;
  console.log('Backend running on http://localhost:3001');
});
