import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import fastify from "fastify";
import plugin from "../index.js";
import type { FastifyInstance } from "fastify";

const remoteAddress = "1.2.3.4";

describe("@jafps/plugin-ip", () => {
  let app: FastifyInstance;
  let app2: FastifyInstance;

  before(async () => {
    app = await fastify({ trustProxy: true });
    await app.register(plugin, {
      headers: [
        "x-client-ip",
        "x-forwarded-for"
      ]
    });
    app.get("/ip", async (req, res) => res.send({
      ip: req.ip,
      ips: req.ips
    }));
    app.get("/ip2", async (req, res) => {
      const a = req.ip;
      return res.send({
        a,
        ip: req.ip,
        ips: req.ips
      });
    });
    app2 = await fastify({ trustProxy: false });
    await app2.register(plugin, {
      headers: [
        "x-client-ip",
        "x-forwarded-for"
      ]
    });
    app2.get("/ip", async (req, res) => res.send({
      ip: req.ip,
      ips: req.ips
    }));
  });

  it("should return value with ips when trustProxy is true", async () => {
    const res = await app.inject({
      remoteAddress,
      url: "/ip"
    });
    const json = res.json();
    assert.ok("ips" in json);
    assert.equal(json.ip, remoteAddress);
  });

  it("should return value with ips when trustProxy is true", async () => {
    const res = await app.inject({
      remoteAddress,
      url: "/ip2"
    });
    const json = res.json();
    assert.ok("ips" in json);
    assert.equal(json.ip, remoteAddress);
  });

  it("should return value with trusting headers when trustProxy is true", async () => {
    const realAddress = "1.2.3.5";
    const res = await app.inject({
      headers: { "x-client-ip": realAddress },
      remoteAddress,
      url: "/ip"
    });
    const json = res.json();
    assert.ok("ips" in json);
    assert.equal(json.ip, realAddress);
    assert.deepEqual(json.ips, [remoteAddress, realAddress]);
  });

  it("should return value with trusting headers when trustProxy is true", async () => {
    const realAddress = "1.2.3.6";
    const proxyAddress = "1.2.3.5";
    const res = await app.inject({
      headers: { "x-client-ip": `${proxyAddress},${realAddress}` },
      remoteAddress,
      url: "/ip"
    });
    const json = res.json();
    assert.ok("ips" in json);
    assert.equal(json.ip, realAddress);
    assert.deepEqual(json.ips, [remoteAddress, proxyAddress, realAddress]);
  });

  it("should return value with trusting headers order when trustProxy is true", async () => {
    const realAddress = "1.2.3.6";
    const proxyAddress = "1.2.3.5";
    const res = await app.inject({
      headers: {
        "x-client-ip": [proxyAddress, realAddress],
        "x-forwarded-for": [realAddress, proxyAddress]
      },
      remoteAddress,
      url: "/ip"
    });
    const json = res.json();
    assert.ok("ips" in json);
    assert.equal(json.ip, realAddress);
    assert.deepEqual(json.ips, [remoteAddress, proxyAddress, realAddress]);
  });

  it("should return without ips when trustProxy is false", async () => {
    const res = await app2.inject({
      remoteAddress,
      url: "/ip"
    });
    const json = res.json();
    assert.ok(!("ips" in json));
    assert.equal(json.ip, remoteAddress);
  });

  it("should return ip without trusting headers when trustProxy is false", async () => {
    const res = await app2.inject({
      headers: { "x-client-ip": "1.2.3.5" },
      remoteAddress,
      url: "/ip"
    });
    const json = res.json();
    assert.ok(!("ips" in json));
    assert.equal(json.ip, remoteAddress);
  });
});
