import { isIP } from "node:net";
import { ipSymbol, proxyHeadersSymbol } from "#symbol";
import type { FastifyRequest } from "fastify";

function parseIPHeaderString(value: string): string[] {
  return value.split(",")
    .map(v => v.trim())
    .filter(v => isIP(v) !== 0);
}

function parseIPHeaders(headerValue: string[] | string | undefined): string[] {
  if (!headerValue) {
    return [];
  }
  const headerValues = Array.isArray(headerValue) ? headerValue : [headerValue];
  return headerValues.flatMap(v => parseIPHeaderString(v));
}

export function getSourceIPs(this: FastifyRequest): string[] {
  if (this[ipSymbol] && this[ipSymbol].length > 0) {
    return this[ipSymbol];
  }
  const sourceAddr = this.raw.socket.remoteAddress ?? "127.0.0.1";
  if (!this.server.isTrustProxy()) {
    return [sourceAddr];
  }
  const ipAddrs = [sourceAddr];
  for (const header of this.server[proxyHeadersSymbol]) {
    const ips = parseIPHeaders(this.headers[header]);
    if (ips.length > 0) {
      ipAddrs.push(...ips);
      break;
    }
  }
  this[ipSymbol] = ipAddrs;
  return ipAddrs;
}
