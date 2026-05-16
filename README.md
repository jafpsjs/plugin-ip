# @jafps/plugin-ip

[![NPM Version](https://img.shields.io/npm/v/%40jafps%2Fplugin-ip)](https://www.npmjs.com/package/@jafps/plugin-ip)

Fastify plugin for determining the address of a proxied request.

Fastify use [@fastify/proxy-addr] by default. It can only parse `X-Forwarded-For`.

## Usage
```
npm install @jafps/plugin-ip
```

```ts
import ipPlugin from "@jafps/plugin-ip";

const app = await fastify({ trustProxy: true })
await app.register(plugin, {
  headers: [
    "true-client-ip",  // Akamai and Cloudflare
    "x-real-ip" // Nginx
  ]
});
```


[@fastify/proxy-addr]: https://github.com/fastify/proxy-addr
