import server from './server';

if (!process.env.NODE_ENV?.startsWith('prod')) {
  server.listen({ port: Number(process.env.SERVER_PORT) }, err => {
    if (err) {
      throw err;
    }

    console.log(`API is running locally on http://localhost:${process.env.SERVER_PORT}`);
  });
}

export { server as fastify };
