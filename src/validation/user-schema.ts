import { z, ZodType } from "zod";

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(3).max(255),
    password: z.string().min(8).max(255),
    payment_account: z
      .object({
        account_number: z
          .string({ message: "invalid account number" })
          .min(8, "invalid account number"),
        type: z.enum(["DEBIT", "CREDIT", "LOAN"]),
        balance: z.number().min(0),
      })
      .optional(),
  });

  static readonly LOGIN: ZodType = z.object({
    username: z.string().min(1).max(255),
    password: z.string().min(1).max(255),
  });
}
