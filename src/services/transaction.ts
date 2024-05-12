import { TransactionValidation } from "./../validation/transaction-schema";
import { ResponseError } from "../errors/response-error";
import { IPaymentHistory } from "../interfaces/payment";
import { ITransaction } from "../interfaces/transaction";
import { validate } from "../validation/validation";
import { TRANSACTION_STATUS } from "@prisma/client";
import { prismaClient } from "../database/db";

class TransactionService {
  static async withdraw(
    userId: number,
    from: string,
    amount: number
  ): Promise<ITransaction> {
    return prismaClient.$transaction(async (tx) => {
      // Validate withdrawal request
      validate(TransactionValidation.WITHDRAW, { from, amount });

      // Check if the user's payment account exists
      const checkUserPaymentAccount = await prismaClient.paymentAccount.count({
        where: { account_number: from, user_id: userId },
      });

      if (!checkUserPaymentAccount) {
        // Throw error if the user's payment account does not exist
        throw new ResponseError(404, "account number not found for this user");
      }

      // Update the balance by decrementing the withdrawal amount
      const updateBalance = await prismaClient.paymentAccount.update({
        where: { account_number: from },
        data: { balance: { decrement: amount } },
      });

      // Check if the updated balance is negative
      if (updateBalance.balance < 0) {
        // Throw error if the balance is insufficient for withdrawal
        throw new ResponseError(400, `${from} doesn't have enough to withdraw`);
      }

      // Create a new transaction record for the withdrawal
      const transaction = await tx.transaction.create({
        data: {
          amount,
          status: TRANSACTION_STATUS.SUCCESS,
          to_address: from,
        },
      });

      // Create a payment history record for the withdrawal
      await tx.paymentHistory.create({
        data: {
          account_number: from,
          transaction_id: transaction.id,
        },
      });

      // Return the transaction details
      return transaction;
    });
  }

  static async send(
    userId: number,
    from: string,
    to: string,
    amount: number
  ): Promise<ITransaction> {
    return prismaClient.$transaction(async (tx) => {
      // Validate the send request
      validate(TransactionValidation.SEND, { from, to, amount });

      // Check if the user's payment account exists
      const checkUserPaymentAccount = await prismaClient.paymentAccount.count({
        where: { account_number: from, user_id: userId },
      });

      if (!checkUserPaymentAccount) {
        // Throw error if the user's payment account does not exist
        throw new ResponseError(404, "account number not found for this user");
      }

      // Check if recipient accounts exist
      const recipient = await tx.paymentAccount.findFirst({
        where: { account_number: to },
      });

      if (!recipient) {
        // Throw error if the recipient's account does not exist
        throw new ResponseError(404, "account number recipient not found");
      }

      // Decrement the balance from the sender's account
      const updatedSender = await tx.paymentAccount.update({
        where: { account_number: from },
        data: { balance: { decrement: amount } },
      });

      // Check if the sender's balance is sufficient
      if (updatedSender.balance < 0) {
        // Throw error if the sender's balance is insufficient for the transaction
        throw new ResponseError(
          400,
          `${from} doesn't have enough to send ${amount}`
        );
      }

      // Increment the balance of the recipient's account
      await tx.paymentAccount.update({
        where: { account_number: to },
        data: { balance: { increment: amount } },
      });

      // Create a new transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount,
          status: TRANSACTION_STATUS.SUCCESS,
          to_address: to,
        },
      });

      // Create a payment history record
      await tx.paymentHistory.create({
        data: {
          account_number: from,
          transaction_id: transaction.id,
        },
      });

      // Return the transaction details
      return transaction;
    });
  }

  static async getPaymentHistory(userId: number): Promise<any> {
    // Validate the user ID
    validate(TransactionValidation.GETPAYMENTHISTORY, { userId });

    // Find the user with the specified user ID and include their payment accounts
    const user = await prismaClient.user.findFirst({
      where: { id: userId },
      include: { payment_account: true },
    });

    // Throw an error if the user is not found
    if (!user) {
      throw new ResponseError(404, "User not found");
    }

    // Initialize an array to store payment history
    const paymentHistory: IPaymentHistory[] = [];

    // Iterate through each payment account of the user
    for (const account of user.payment_account) {
      // Retrieve payment histories associated with the current account
      const histories = await prismaClient.paymentHistory.findMany({
        where: { account_number: account.account_number },
        include: { transaction: true }, // Include transaction details
      });

      // Add the retrieved payment histories to the paymentHistory array
      paymentHistory.push(...histories);
    }

    // Return the payment history
    return paymentHistory;
  }
}

export default TransactionService;
