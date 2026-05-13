import fp from "fastify-plugin";
import { getSourceIPs, isTrustProxy } from "#func";
import { onRequest } from "#hook";
import { ipSymbol, proxyHeadersSymbol } from "#symbol";

export type TemplatePluginOptions = {
  headers: string[];
};

export const name = "@jafps/plugin-ip";

export default fp<TemplatePluginOptions>(
  async (app, opts) => {
    const { headers } = opts;
    app.decorate(proxyHeadersSymbol, headers);
    app.decorate("isTrustProxy", isTrustProxy);
    app.decorateRequest(ipSymbol, null);
    app.decorateRequest("getSourceIPs", getSourceIPs);
    app.addHook("onRequest", onRequest);
  },
  {
    decorators: {},
    dependencies: [],
    fastify: "5.x",
    name
  }
);

/* node:coverage disable */
declare module "fastify" {
  interface FastifyInstance {
    isTrustProxy: OmitThisParameter<typeof isTrustProxy>;
    [proxyHeadersSymbol]: string[];
  }

  interface FastifyRequest {
    getSourceIPs: OmitThisParameter<typeof getSourceIPs>;
    [ipSymbol]: string[] | null;
  }
}
