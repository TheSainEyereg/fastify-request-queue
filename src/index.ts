import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { randomUUID } from "node:crypto";
import EventEmitter from "node:events";

declare module "fastify" {
	interface FastifyRequest {
		queueId: string;
	}
}

const plugin: FastifyPluginAsync = async (app) => {
	const queue: string[] = [];
	const event = new EventEmitter<{ "onShift": [id: string] }>();

	event.setMaxListeners(0);

	app.addHook("onRequest", (req, reply, done) => {
		req.queueId = randomUUID();

		const length = queue.push(req.queueId);

		if (length > 1) {
			const callback = (id: string) => {
				if (id === req.queueId) {
					event.removeListener("onShift", callback);
					done();
				}
			};

			event.addListener("onShift", callback);
		}
		else
			done();
	});

	const shift = (req: FastifyRequest, mustShift?: boolean) => {
		const { queueId, raw: { aborted } } = req;
		if (queueId && (aborted || mustShift)) {
			queue.shift();
			event.emit("onShift", queue[0]);
		}
	};

	app.addHook("preParsing", async (req) => shift(req));
	app.addHook("preValidation", async (req) => shift(req));
	app.addHook("preHandler", async (req) => shift(req));
	app.addHook("onSend", async (req) => shift(req, true));
};

export default fp(plugin);