import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fastify from "fastify";
import { isTrustProxy } from "../is-trust-proxy.js";

describe("isTrustProxy", () => {
  it("should return true when trustProxy is true", async () => {
    const app = await fastify({ trustProxy: true });
    assert.ok(isTrustProxy.bind(app)());
  });

  it("should return false when trustProxy is false", async () => {
    const app = await fastify({ trustProxy: true });
    assert.ok(isTrustProxy.bind(app)());
  });
});
