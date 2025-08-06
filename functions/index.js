// See a full list of supported triggers at:
// https://firebase.google.com/docs/functions

import { setGlobalOptions } from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import fastify from "./lib/server.js";

// For cost control, you can set the maximum number of containers that
// can be running at the same time. This helps mitigate the impact of
// unexpected traffic spikes by instead downgrading performance.
// This limit is a per-function limit. You can override it for each
// function using the `maxInstances` option in the function's options,
// e.g.: `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
setGlobalOptions({ maxInstances: 10, region: 'europe-west1' });

fastify.addHook("onRequest", (req, reply, done) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  done();
});

fastify.addHook("onResponse", (req, reply, done) => {
  logger.info(`Response: ${reply.statusCode} for ${req.method} ${req.url}`);
  done();
});

// Start writing functions:
// https://firebase.google.com/docs/functions/typescript

export const api = onRequest(async (request, response) => {
  try {
    await fastify.ready();
    fastify.server.emit("request", request, response);
  } catch (ex) {
    logger.error(ex);
    response.status(500).send("Internal Server Error");
  }
});
