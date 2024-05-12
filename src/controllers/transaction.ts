import { ITransferRequest, IWithdrawRequest } from "../interfaces/transaction";
import { errorFilter } from "../middlewares/error-handling";
import TransactionService from "../services/transaction";
import { FastifyReply, FastifyRequest } from "fastify";

class TransactionController {
  static async send(req: FastifyRequest, res: FastifyReply) {
    try {
      const userId = req.user["id"];
      const { from, to, amount } = req.body as ITransferRequest;

      const result = await TransactionService.send(userId, from, to, amount);
      return res.code(200).send({
        data: result,
      });
    } catch (e) {
      errorFilter(e, res);
    }
  }

  static async withdraw(req: FastifyRequest, res: FastifyReply) {
    try {
      const userId = req.user["id"];
      const { from, amount } = req.body as IWithdrawRequest;

      const result = await TransactionService.withdraw(userId, from, amount);
      return res.code(200).send({
        data: result,
      });
    } catch (e) {
      errorFilter(e, res);
    }
  }

  static async getPaymentHistory(req: FastifyRequest, res: FastifyReply) {
    try {
      const userId = req.user["id"];

      const result = await TransactionService.getPaymentHistory(userId);
      return res.code(200).send({
        data: result,
      });
    } catch (e) {
      errorFilter(e, res);
    }
  }
}

export default TransactionController;
