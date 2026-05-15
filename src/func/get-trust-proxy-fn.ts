import { compile } from "@fastify/proxy-addr";
import type { TrustProxyFunction, TrustProxyOption } from "#type";

export function getTrustProxyFn(opt: TrustProxyOption): TrustProxyFunction {
  if (typeof opt === "function") {
    return opt;
  }
  if (typeof opt === "boolean") {
    return function () {
      return opt;
    };
  }
  if (typeof opt === "number") {
    // Support trusting hop count
    return function (_address: string, hop: number) {
      return hop < opt;
    };
  }
  if (typeof opt === "string") {
    // Support comma-separated tps
    const values = opt.split(",").map(it => it.trim());
    return compile(values);
  }
  return compile(opt);
}
