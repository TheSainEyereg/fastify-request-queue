# fastify-request-queue

A plugin for [Fastify](https://www.fastify.io/) that ensures methods are executed sequentially, preventing race conditions or overlapping executions in your routes. This is particularly useful for scenarios where order of operations matters, such as processing transactions or handling resource-intensive tasks.

## Installation

```bash
pnpm add fastify-request-queue
# or
yarn add fastify-request-queue
# or
npm install fastify-request-queue
```

## Usage

In this example, the `/process` endpoint will execute requests sequentially, ensuring that each request completes before the next one begins.

### CommonJS Example

```js
const fastify = require("fastify")();
const fastifyRequestQueue = require("fastify-request-queue");

fastify.register(fastifyRequestQueue, app => {
    app.post("/process", async (request, reply) => {
        const { id } = request.body;
        // Simulate some async work
        await new Promise(resolve => setTimeout(resolve, 1000));
        reply.send({ message: `Processed item ${id}` });
    });
});

fastify
    .listen({ port: 3000, host: "0.0.0.0" })
    .then(at => console.log("Server started at", at));
```

### TypeScript Example

```ts
import Fastify from 'fastify';
import fastifyRequestQueue from 'fastify-request-queue';

const app = Fastify();

app.register(fastifyRequestQueue, (app) => {
    app.post<{ Body: { id: number } }>('/process', async (request, reply) => {
        const { id } = request.body;
        // Simulate some async work
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { message: `Processed item ${id}` };
    });
});

app.listen({ port: 3000, host: '0.0.0.0' })
    .then(at => console.log("Server started at", at));
```

## License

Licensed under [MIT](./LICENSE).