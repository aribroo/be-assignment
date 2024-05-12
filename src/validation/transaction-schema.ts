import { z, ZodType } from "zod";

export class TransactionValidation {
  static readonly SEND: ZodType = z.object({
    from: z.string().min(8, "invalid account number"),
    to: z.string().min(8, "invalid account number"),
    amount: z
      .number()
      .min(100_000, "amount must be greater than 100,000 for sending"),
  });

  static readonly WITHDRAW: ZodType = z.object({
    from: z.string().min(8, "invalid account number"),
    amount: z
      .number()
      .min(50_000, "amount must be greater than 50,000 for withdraw"),
  });

  static readonly GETPAYMENTHISTORY: ZodType = z.object({
    userId: z.number(),
  });
}
