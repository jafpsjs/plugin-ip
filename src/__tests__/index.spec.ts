import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import fastify from "fastify";
import plugin from "../index.js";
import type { FastifyInstance } from "fastify";

function addRoutes(app: FastifyInstance): void {
  app.get("/ip", async (req, res) => res.send({
    ip: req.ip,
    ip2: req.ip,
    ips: req.ips
  }));
}

const remoteAddress = "1.2.3.4";
const realAddress1 = "2.3.4.5";
const realAddress2 = "2.3.4.6";
const proxyHeader1 = "x-client-ip";
const proxyHeader2 = "x-forwarded-for";

describe("@jafps/plugin-ip", () => {
  describe("trustProxy is true", () => {
    let app: FastifyInstance;

    before(async () => {
      app = await fastify({ trustProxy: true });
      addRoutes(app);
      await app.register(plugin, {
        headers: [
          proxyHeader1,
          proxyHeader2
        ]
      });
    });

    it("should return request ip when no proxy headers", async () => {
      const res = await app.inject({
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
      assert.deepEqual(json.ips, [remoteAddress]);
    });

    it("should return proxy ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress1);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1]);
    });

    it("should return proxy ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader2]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress1);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1]);
    });

    it("should return proxy ips when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: [realAddress1, realAddress2] },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress2);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1, realAddress2]);
    });

    it("should return proxy ips when headers exist", async () => {
      const res = await app.inject({
        headers: {
          [proxyHeader1]: [realAddress1, realAddress2],
          [proxyHeader2]: [realAddress2, realAddress1]
        },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress2);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1, realAddress2]);
    });
  });

  describe("trustProxy is 2.3.4.0/24", () => {
    let app: FastifyInstance;
    const remoteAddress = "2.3.4.3";
    const remoteAddress2 = "1.2.3.4";

    before(async () => {
      app = await fastify({ trustProxy: "2.3.4.0/24" });
      addRoutes(app);
      await app.register(plugin, {
        headers: [
          proxyHeader1,
          proxyHeader2
        ]
      });
    });

    it("should return request ip when no proxy headers", async () => {
      const res = await app.inject({
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
      assert.deepEqual(json.ips, [remoteAddress]);
    });

    it("should return proxy ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress1);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1]);
    });

    it("should return proxy ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader2]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress1);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1]);
    });

    it("should return proxy ips when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: [realAddress1, realAddress2] },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress2);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1, realAddress2]);
    });

    it("should return proxy ips when headers exist", async () => {
      const res = await app.inject({
        headers: {
          [proxyHeader1]: [realAddress1, realAddress2],
          [proxyHeader2]: [realAddress2, realAddress1]
        },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress2);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1, realAddress2]);
    });

    it("should return request ip when no proxy headers and not in proxy range", async () => {
      const res = await app.inject({
        remoteAddress: remoteAddress2,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress2);
      assert.deepEqual(json.ips, [remoteAddress2]);
    });

    it("should return request ip when header exists and not in proxy range", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: realAddress1 },
        remoteAddress: remoteAddress2,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress2);
      assert.deepEqual(json.ips, [remoteAddress2]);
    });

    it("should return request ip when header exists and not in proxy range", async () => {
      const res = await app.inject({
        headers: { [proxyHeader2]: realAddress1 },
        remoteAddress: remoteAddress2,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress2);
      assert.deepEqual(json.ips, [remoteAddress2]);
    });

    it("should return request ips when header exists and not in proxy range", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: [realAddress1, realAddress2] },
        remoteAddress: remoteAddress2,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress2);
      assert.deepEqual(json.ips, [remoteAddress2]);
    });

    it("should return request ips when headers exist and not in proxy range", async () => {
      const res = await app.inject({
        headers: {
          [proxyHeader1]: [realAddress1, realAddress2],
          [proxyHeader2]: [realAddress2, realAddress1]
        },
        remoteAddress: remoteAddress2,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress2);
      assert.deepEqual(json.ips, [remoteAddress2]);
    });

    it("should return proxy ips when headers exist and some in proxy range", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: [realAddress1, remoteAddress2, realAddress2] },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress2);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1, remoteAddress2]);
    });
  });

  describe("trustProxy is function", () => {
    let app: FastifyInstance;

    before(async () => {
      app = await fastify({ trustProxy: () => true });
      addRoutes(app);
      await app.register(plugin, {
        headers: [
          proxyHeader1,
          proxyHeader2
        ]
      });
    });

    it("should return request ip when no proxy headers", async () => {
      const res = await app.inject({
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
      assert.deepEqual(json.ips, [remoteAddress]);
    });

    it("should return proxy ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress1);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1]);
    });

    it("should return proxy ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader2]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress1);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1]);
    });

    it("should return proxy ips when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: [realAddress1, realAddress2] },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress2);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1, realAddress2]);
    });

    it("should return proxy ips when headers exist", async () => {
      const res = await app.inject({
        headers: {
          [proxyHeader1]: [realAddress1, realAddress2],
          [proxyHeader2]: [realAddress2, realAddress1]
        },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress2);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1, realAddress2]);
    });
  });

  describe("trustProxy is 1", () => {
    let app: FastifyInstance;

    before(async () => {
      app = await fastify({ trustProxy: 1 });
      addRoutes(app);
      await app.register(plugin, {
        headers: [
          proxyHeader1,
          proxyHeader2
        ]
      });
    });

    it("should return request ip when no proxy headers", async () => {
      const res = await app.inject({
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
      assert.deepEqual(json.ips, [remoteAddress]);
    });

    it("should return proxy ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress1);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1]);
    });

    it("should return proxy ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader2]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress1);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1]);
    });

    it("should return proxy ips when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: [realAddress1, realAddress2] },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress1);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1]);
    });

    it("should return proxy ips when headers exist", async () => {
      const res = await app.inject({
        headers: {
          [proxyHeader1]: [realAddress1, realAddress2],
          [proxyHeader2]: [realAddress2, realAddress1]
        },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, realAddress1);
      assert.deepEqual(json.ips, [remoteAddress, realAddress1]);
    });
  });

  describe("trustProxy is false", () => {
    let app: FastifyInstance;

    before(async () => {
      app = await fastify({ trustProxy: false });
      addRoutes(app);
      await app.register(plugin, {
        headers: [
          proxyHeader1,
          proxyHeader2
        ]
      });
    });

    it("should return request ip when no proxy headers", async () => {
      const res = await app.inject({
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
    });

    it("should return request ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
    });

    it("should return request ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader2]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
    });

    it("should return request ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: [realAddress1, realAddress2] },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
    });
  });

  describe("trustProxy is undefined", () => {
    let app: FastifyInstance;

    before(async () => {
      app = await fastify();
      addRoutes(app);
      await app.register(plugin, {
        headers: [
          proxyHeader1,
          proxyHeader2
        ]
      });
    });

    it("should return request ip when no proxy headers", async () => {
      const res = await app.inject({
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
    });

    it("should return request ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
    });

    it("should return request ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader2]: realAddress1 },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
    });

    it("should return request ip when header exists", async () => {
      const res = await app.inject({
        headers: { [proxyHeader1]: [realAddress1, realAddress2] },
        remoteAddress,
        url: "/ip"
      });
      const json = res.json();
      assert.equal(json.ip, remoteAddress);
    });
  });
});
