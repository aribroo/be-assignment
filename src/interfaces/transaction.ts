import { TRANSACTION_STATUS } from "@prisma/client";

export interface ITransferRequest {
  from: string;
  to: string;
  amount: number;
}

export interface IWithdrawRequest {
  from: string;
  amount: number;
}

export interface ITransaction {
  id: string;
  amount: number;
  to_address: string;
  status: TRANSACTION_STATUS;
  timestamp: Date;
}
