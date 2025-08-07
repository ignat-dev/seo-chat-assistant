import fastifyCors from '@fastify/cors';
import Fastify from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import { firebaseApp } from './firebase/firebaseApp';
import routes from './routes';
import { ServerReply, ServerRequest } from './types';

const server = Fastify();

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

server.addContentTypeParser('application/json', {}, (req: any, payload: any, done) => {
  // It's useful to include the request's raw body on the `req` object,
  // that will later be available in the other routes, in order to
  // calculate the HMAC, if needed.
  req.rawBody = payload.rawBody;

  // `payload.body` is the parsed JSON, so just fire the callback with it.
  done(null, payload.body);
});

// Add prefix to routes to unify the access between local and cloud environment.
server.register(routes, { prefix: `/${process.env.GOOGLE_CLOUD_FUNCTION_NAME}` });

export default server;
