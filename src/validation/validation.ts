import { ZodType } from "zod";

export function validate<T>(zodType: ZodType<T>, data: T): T {
  return zodType.parse(data);
}
