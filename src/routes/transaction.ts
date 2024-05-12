import TransactionController from "../controllers/transaction";
import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth";
import {
  paymentHistorySchema,
  sendBalanceSchema,
  withdrawSchema,
} from "../swagger/transaction-schema";

async function transactionRouter(fastify: FastifyInstance) {
  // API for transfer
  fastify.route({
    method: "POST",
    url: "/send",
    preHandler: [authMiddleware],
    handler: TransactionController.send,
    schema: sendBalanceSchema,
  });

  // API for withdraw
  fastify.route({
    method: "POST",
    url: "/withdraw",
    preHandler: [authMiddleware],
    handler: TransactionController.withdraw,
    schema: withdrawSchema,
  });

  // API for get payment history
  fastify.route({
    method: "GET",
    url: "/payment-history",
    preHandler: [authMiddleware],
    handler: TransactionController.getPaymentHistory,
    schema: paymentHistorySchema,
  });
}

export default transactionRouter;
