import symbols from "fastify/lib/symbols.js";

export const ipSymbol = Symbol("ip");
export const proxyHeadersSymbol = Symbol("proxy headers");
export const optionsSymbol: unique symbol = symbols.kOptions as any;
