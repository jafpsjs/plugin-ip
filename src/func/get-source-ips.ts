import { isIP } from "node:net";
import { ipSymbol, optionsSymbol, proxyHeadersSymbol } from "#symbol";
import { getTrustProxyFn } from "./get-trust-proxy-fn.js";
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
  const { trustProxy = false } = this.server[optionsSymbol];
  const sourceAddr = this.raw.socket.remoteAddress ?? "127.0.0.1";
  const proxyFn = getTrustProxyFn(trustProxy);
  const ipAddrs = [sourceAddr];

  for (const header of this.server[proxyHeadersSymbol]) {
    const ips = parseIPHeaders(this.headers[header]);
    if (ips.length > 0) {
      ipAddrs.push(...ips);
      for (const [i, ip] of ipAddrs.entries()) {
        if (proxyFn(ip, i)) {
          continue;
        }
        ipAddrs.length = i + 1;
        break;
      }
      break;
    }
  }
  this[ipSymbol] = ipAddrs;
  return ipAddrs;
}
