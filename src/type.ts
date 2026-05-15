import type { FastifyServerOptions } from "fastify";

export type TrustProxyOption = Exclude<FastifyServerOptions["trustProxy"], undefined>;
export type TrustProxyFunction = (address: string, hop: number) => boolean;
