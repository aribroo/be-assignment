import { authMiddleware } from "../middlewares/auth";
import UserController from "../controllers/user";
import { FastifyInstance } from "fastify";
import { getPaymentAccountSchema, loginrUserSchema, registerUserSchema } from "../swagger";

async function userRouter(fastify: FastifyInstance) {
  // API for register user
  fastify.route({
    method: "POST",
    url: "/register",
    handler: UserController.register,
    schema: registerUserSchema
  });

  // API for login user
  fastify.route({
    method: "POST",
    url: "/login",
    handler: UserController.login,
    schema: loginrUserSchema
  });

  // API for retrieve all payment accounts
  fastify.route({
    method: "GET",
    url: "/payment-accounts",
    preHandler: [authMiddleware],
    handler: UserController.getAccountPayment,
    schema : getPaymentAccountSchema
  });
}

export default userRouter;
