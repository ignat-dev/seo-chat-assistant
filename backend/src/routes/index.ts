import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/ping', async () => {
    return { hello: 'world' };
  });

  // Future endpoints like /messages will go here
}
