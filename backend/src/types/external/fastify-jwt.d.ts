import { FastifyJWT as IFastifyJWT } from "@fastify/jwt";
import { DecodedIdToken } from "firebase-admin/auth";

declare module "@fastify/jwt" {
  export interface FastifyJWT extends IFastifyJWT {
		user: DecodedIdToken;
	}
}
