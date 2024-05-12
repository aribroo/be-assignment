import { IPaymentAccount } from "./payment";
import { Prisma } from "@prisma/client";

export interface IUser {
  id: number;
  username: string;
  password: string;
}

export interface IUserToken {
  id: number;
  username: string;
  iat: number;
  exp: number;
}

export interface IUserRegisterRequest {
  username: string;
  password: string;
  payment_account?: IPaymentAccount;
}

export interface IUserLoginRequest {
  username: string;
  password: string;
}

export interface IUserRegisterResponse {
  id: number;
  username: string;
  payment_account: Prisma.PaymentAccountWhereInput[];
}
