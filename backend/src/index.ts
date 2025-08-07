import server from './server';

if (!process.env.NODE_ENV?.startsWith('prod')) {
  server.listen({ port: Number(process.env.SERVER_PORT) }, err => {
    if (err) {
      throw err;
    }

    const port = process.env.SERVER_PORT;
    const name = process.env.GOOGLE_CLOUD_FUNCTION_NAME;

    console.log(`API is running locally on http://localhost:${port}/${name}`);
  });
}

export { server as fastify };
