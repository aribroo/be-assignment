import { ACCOUNT_TYPE } from "@prisma/client";

export interface IPaymentAccount {
  account_number: string;
  user_id: number;
  type: ACCOUNT_TYPE;
  balance: number;
}

export interface IPaymentHistory {
  id: number;
  transaction_id: string;
  account_number: string;
}
