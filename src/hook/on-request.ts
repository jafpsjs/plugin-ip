import type { onRequestHookHandler } from "fastify";

export const onRequest: onRequestHookHandler = async function (this, req) {
  Object.defineProperty(req, "ip", {
    get() {
      const addrs = req.getSourceIPs();
      return addrs[addrs.length - 1];
    }
  });
  Object.defineProperty(req, "ips", {
    get() {
      return req.getSourceIPs();
    }
  });
};
