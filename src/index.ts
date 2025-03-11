import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import EventEmitter from "node:events";

declare module "fastify" {
	interface FastifyRequest {
		queueId: string;
	}
}

const plugin: FastifyPluginAsync = async (app) => {
	const queue: string[] = [];
	const event = new EventEmitter<{ "onShift": [id: string] }>();

	app.addHook("onRequest", (req, reply, done) => {
		req.queueId = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

		const length = queue.push(req.queueId);

		if (length > 1)
			return event.addListener("onShift", (id) => id === req.queueId && done());

		done();
	});

	app.addHook("onResponse", async (req) => {
		if (req.queueId) {
			queue.splice(queue.indexOf(req.queueId), 1);
			event.emit("onShift", queue[0]);
		}
	});
};

export default fp(plugin);