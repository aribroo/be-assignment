import { IUser, IUserRegisterResponse } from "../interfaces/user";
import { UserValidation } from "../validation/user-schema";
import { ResponseError } from "../errors/response-error";
import { IPaymentAccount } from "../interfaces/payment";
import { validate } from "../validation/validation";
import { prismaClient } from "../database/db";
import PasswordUtil from "../utils/password";
import { Prisma } from "@prisma/client";
import TokenUtil from "../utils/token";

class UserService {
  static async register(
    username: string,
    password: string,
    paymentAccount?: IPaymentAccount
  ): Promise<IUserRegisterResponse> {
    validate(UserValidation.REGISTER, {
      username,
      password,
      payment_account: paymentAccount,
    });

    const isUserExist: number = await prismaClient.user.count({
      where: { username },
    });

    if (isUserExist != 0) {
      throw new ResponseError(400, "user already exist");
    }

    const hashedPassword = await PasswordUtil.hash(password);

    const newUser: Prisma.UserCreateInput = {
      username,
      password: hashedPassword,
    };

    if (paymentAccount) {
      newUser.payment_account = {
        create: {
          account_number: paymentAccount.account_number,
          type: paymentAccount.type,
          balance: paymentAccount.balance,
        },
      };
    }

    const user = await prismaClient.user.create({
      data: newUser,
      include: { payment_account: true },
    });

    return {
      id: user.id,
      username: user.username,
      payment_account: user.payment_account,
    };
  }

  static async login(username: string, password: string): Promise<string> {
    validate(UserValidation.LOGIN, { username, password });

    const user: IUser | null = await prismaClient.user.findFirst({
      where: { username },
    });

    if (!user || !(await PasswordUtil.compare(password, user.password))) {
      throw new ResponseError(400, "username or password is wrong");
    }

    const payload = {
      id: user.id,
      username: user.username,
    };

    const accessToken: string = TokenUtil.generateToken(payload);

    return accessToken;
  }

  static async getAccountPayment(userId: number): Promise<IPaymentAccount[]> {
    const accounts = await prismaClient.paymentAccount.findMany({
      where: { user_id: userId },
      select: {
        account_number: true,
        type: true,
        balance: true,
      },
    });

    return accounts as IPaymentAccount[];
  }
}

export default UserService;
