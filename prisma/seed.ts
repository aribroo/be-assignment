import * as bcrypt from "bcrypt";
import { ACCOUNT_TYPE, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  async function hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  await prisma.user.create({
    data: {
      username: "rifkiari",
      password: await hash("rifkiari"),
      payment_account: {
        create: {
          account_number: "1111-2222-3333-4444",
          balance: 5_000_000,
          type: ACCOUNT_TYPE.DEBIT,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      username: "johndoe",
      password: await hash("johndoe"),
      payment_account: {
        create: {
          account_number: "1234-5678-9999-0000",
          balance: 5_000_000,
          type: ACCOUNT_TYPE.DEBIT,
        },
      },
    },
  });

  console.info("user created successfully");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
