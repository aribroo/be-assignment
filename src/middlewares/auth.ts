import { FastifyReply, FastifyRequest } from "fastify";
import { prismaClient } from "../database/db";
import TokenUtil from "../utils/token";

export const authMiddleware = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const authorization: any = req.headers["authorization"]?.split(" ");

    if (!authorization || authorization[0] !== "Bearer") {
      return res.code(401).send({
        errors: "Unauthorized",
      });
    }

    const token = authorization[1];
    const result: any = TokenUtil.verifyToken(token);

    if (
      !result.id ||
      (await prismaClient.user.count({ where: { id: result.id } })) == 0
    ) {
      return res.code(401).send({
        errors: "Unauthorized",
      });
    }

    req.user = result;
  } catch (e) {
    return res.code(401).send({
      errors: "Unauthorized",
    });
  }
};

declare module "fastify" {
  interface FastifyRequest {
    user: any;
  }
}
