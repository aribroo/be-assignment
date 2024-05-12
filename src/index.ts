import transactionRouter from "./routes/transaction";
import userRouter from "./routes/user";
import cors from "@fastify/cors";
import fastify from "fastify";
import pino from "pino";

const server = fastify({
  logger: pino({ level: "info" }),
});

server.register(import("@fastify/swagger"));
server.register(import("@fastify/swagger-ui"), {
  prefix: "/docs",
});

server.register(cors, {});

server.register(userRouter, { prefix: "api/users" });
server.register(transactionRouter, { prefix: "api/transactions" });

const start = async () => {
  const appPort: number = Number(process.env.APP_PORT) || 3000;
  const appHost: string = String(process.env.APP_HOST) || "localhost";

  server.listen({ port: appPort, host: appHost }, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    server.log.info("Server is running successfully");
    server.log.info(
      `Swagger documentation at http://${appHost}:${appPort}/docs`
    );
  });
};

const listeners = ["SIGINT", "SIGTERM"];
listeners.forEach((signal) => {
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
});

start();

export { start, server };
