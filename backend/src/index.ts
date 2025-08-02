import { initializeApp, applicationDefault } from 'firebase-admin/app';
import routes from './routes';
import server from './server';

initializeApp({ credential: applicationDefault() });

server.register(routes).listen({ port: Number(process.env.SERVER_PORT) }, err => {
  if (err) {
    throw err;
  }

  console.log(`Backend running on http://localhost:${process.env.SERVER_PORT}`);
});
