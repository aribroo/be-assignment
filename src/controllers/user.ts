import { IUserLoginRequest, IUserRegisterRequest } from "../interfaces/user";
import { errorFilter } from "../middlewares/error-handling";
import { FastifyReply, FastifyRequest } from "fastify";
import UserService from "../services/user";

class UserController {
  static async register(req: FastifyRequest, res: FastifyReply) {
    try {
      const { username, password, payment_account } =
        req.body as IUserRegisterRequest;

      const result = await UserService.register(
        username,
        password,
        payment_account
      );
      return res.code(201).send({
        data: result,
      });
    } catch (e) {
      errorFilter(e, res);
    }
  }

  static async login(req: FastifyRequest, res: FastifyReply) {
    try {
      const { username, password } = req.body as IUserLoginRequest;

      const result = await UserService.login(username, password);
      return res.code(200).send({
        data: {
          accessToken: result,
        },
      });
    } catch (e) {
      errorFilter(e, res);
    }
  }

  static async getAccountPayment(req: FastifyRequest, res: FastifyReply) {
    try {
      const userId = req.user["id"];

      const result = await UserService.getAccountPayment(userId);
      return res.code(200).send({
        data: result,
      });
    } catch (e) {
      errorFilter(e, res);
    }
  }
}

export default UserController;
