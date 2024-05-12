import { ResponseError } from "../errors/response-error";
import { Prisma } from "@prisma/client";
import { FastifyReply } from "fastify";
import { ZodError } from "zod";

export const errorFilter = (e: unknown, res: FastifyReply) => {
  if (e instanceof ResponseError) {
    return res.code(e.statusCode).send({
      errors: e.message,
    });
  } else if (e instanceof ZodError) {
    const errors = [];

    for (let i = 0; i < e.errors.length; i++) {
      errors.push({
        message: e.errors[i].message,
        path: e.errors[i].path,
      });
    }

    return res.code(400).send({
      errors,
    });
  } else if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      return res.code(400).send({
        errors: "account number already exists",
      });
    }
  } else {
    return res.code(500).send(e);
  }
};
