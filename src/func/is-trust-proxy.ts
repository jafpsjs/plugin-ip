import type { FastifyInstance } from "fastify";

export function isTrustProxy(this: FastifyInstance): boolean {
  return [
    "ip",
    "ips",
    "hostname",
    "protocol"
  ].every(key => this.hasRequestDecorator(key));
}
