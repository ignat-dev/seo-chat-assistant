import { FastifyRequest } from "fastify";

export type ServerRequest = FastifyRequest<{
  Body: Record<string, string>,
  Params: Record<string, string>,
  Querystring: Record<string, string>,
}>;
