import fp from "fastify-plugin";
import { getSourceIPs } from "#func";
import { onRequest } from "#hook";
import { ipSymbol, optionsSymbol, proxyHeadersSymbol } from "#symbol";
import type {
  FastifyBaseLogger,
  FastifyServerOptions,
  FastifyTypeProvider,
  FastifyTypeProviderDefault,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault
} from "fastify";

export type IpPluginOptions = {
  headers: string[];
};

export const name = "@jafps/plugin-ip";

export default fp<IpPluginOptions>(
  async (app, opts) => {
    const { headers } = opts;
    const { trustProxy = false } = app[optionsSymbol];
    app.decorate(proxyHeadersSymbol, headers);
    app.decorateRequest(ipSymbol, null);
    app.decorateRequest("getSourceIPs", getSourceIPs);
    if (trustProxy) {
      app.addHook("onRequest", onRequest);
    }
  },
  {
    decorators: {},
    dependencies: [],
    fastify: "5.x",
    name
  }
);

/* node:coverage disable */
type ServerOptions<RawServer extends RawServerBase, Logger extends FastifyBaseLogger> = FastifyServerOptions<RawServer, Logger>;

/* eslint-disable @typescript-eslint/no-unused-vars */
declare module "fastify" {
  interface FastifyInstance<
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
    RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
    Logger extends FastifyBaseLogger = FastifyBaseLogger,
    TypeProvider extends FastifyTypeProvider = FastifyTypeProviderDefault
  > {
    [optionsSymbol]: ServerOptions<RawServer, Logger>;
    [proxyHeadersSymbol]: string[];
  }

  interface FastifyRequest {
    getSourceIPs: OmitThisParameter<typeof getSourceIPs>;
    [ipSymbol]: string[] | null;
  }
}
