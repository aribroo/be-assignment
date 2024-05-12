import { ACCOUNT_TYPE } from "@prisma/client";
import { prismaClient } from "../src/database/db";
import { server } from "../src/index";
import PasswordUtil from "../src/utils/password";

afterAll(async () => {
  await server.close();
});

describe("API Transaction", () => {
  describe("POST api/transactions/send", () => {
    beforeEach(async () => {
      await prismaClient.user.create({
        data: {
          username: "rifkiari",
          password: await PasswordUtil.hash("rifkiari"),
          payment_account: {
            create: {
              account_number: "1111-2222-3333-4444",
              type: ACCOUNT_TYPE.DEBIT,
              balance: 5_000_000,
            },
          },
        },
        include: { payment_account: true },
      });

      await prismaClient.user.create({
        data: {
          username: "johndoe",
          password: await PasswordUtil.hash("johndoe"),
          payment_account: {
            create: {
              account_number: "1234-5678-9999-0000",
              type: ACCOUNT_TYPE.DEBIT,
              balance: 5_000_000,
            },
          },
        },
        include: { payment_account: true },
      });
    });

    afterEach(async () => {
      await prismaClient.user.deleteMany();
    });

    test("Transfer success", async () => {
      const user = await server.inject({
        method: "POST",
        url: "api/users/login",
        body: {
          username: "rifkiari",
          password: "rifkiari",
        },
      });

      const userResponse = JSON.parse(user.body);
      const accessToken = userResponse.data.accessToken;

      const result = await server.inject({
        method: "POST",
        url: "api/transactions/send",
        body: {
          from: "1111-2222-3333-4444",
          to: "1234-5678-9999-0000",
          amount: 2_000_000,
        },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const resultBody = JSON.parse(result.body);

      const [sender, recipient] = await prismaClient.paymentAccount.findMany({
        where: {
          OR: [
            { account_number: "1111-2222-3333-4444" },
            { account_number: "1234-5678-9999-0000" },
          ],
        },
      });

      expect(result.statusCode).toBe(200);
      expect(resultBody.errors).toBeUndefined();
      expect(resultBody.data).toBeDefined();
      expect(sender.balance).toEqual(3_000_000);
      expect(recipient.balance).toEqual(7_000_000);
    });

    test("Transfer failed if token not provided", async () => {
      const result = await server.inject({
        method: "POST",
        url: "api/transactions/send",
        body: {
          from: "1111-2222-3333-4444",
          to: "1234-5678-9999-0000",
          amount: 2_000_000,
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(401);
      expect(resultBody.data).toBeUndefined();
      expect(resultBody.errors).toEqual("Unauthorized");
    });

    test("Transfer failed if account payment not found in user", async () => {
      const user = await server.inject({
        method: "POST",
        url: "api/users/login",
        body: {
          username: "rifkiari",
          password: "rifkiari",
        },
      });

      const userResponse = JSON.parse(user.body);
      const accessToken = userResponse.data.accessToken;

      const result = await server.inject({
        method: "POST",
        url: "api/transactions/send",
        body: {
          from: "0000-0000-0000-0000",
          to: "1234-5678-9999-0000",
          amount: 2_000_000,
        },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(404);
      expect(resultBody.data).toBeUndefined();
      expect(resultBody.errors).toEqual(
        "account number not found for this user"
      );
    });

    test("Transfer failed if recipient account number not found", async () => {
      const user = await server.inject({
        method: "POST",
        url: "api/users/login",
        body: {
          username: "rifkiari",
          password: "rifkiari",
        },
      });

      const userResponse = JSON.parse(user.body);
      const accessToken = userResponse.data.accessToken;

      const result = await server.inject({
        method: "POST",
        url: "api/transactions/send",
        body: {
          from: "1111-2222-3333-4444",
          to: "4564-2156-8775-3310",
          amount: 2_000_000,
        },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(404);
      expect(resultBody.data).toBeUndefined();
      expect(resultBody.errors).toEqual("account number recipient not found");
    });

    test("Transfer failed if insufficient balance", async () => {
      const user = await server.inject({
        method: "POST",
        url: "api/users/login",
        body: {
          username: "rifkiari",
          password: "rifkiari",
        },
      });

      const userResponse = JSON.parse(user.body);
      const accessToken = userResponse.data.accessToken;

      const result = await server.inject({
        method: "POST",
        url: "api/transactions/send",
        body: {
          from: "1111-2222-3333-4444",
          to: "1234-5678-9999-0000",
          amount: 20_000_000,
        },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(400);
      expect(resultBody.data).toBeUndefined();
      expect(resultBody.errors).toBeDefined();
    });
  });

  describe("POST api/transactions/withdraw", () => {
    beforeEach(async () => {
      await prismaClient.user.create({
        data: {
          username: "rifkiari",
          password: await PasswordUtil.hash("rifkiari"),
          payment_account: {
            create: {
              account_number: "1111-2222-3333-4444",
              type: ACCOUNT_TYPE.DEBIT,
              balance: 5_000_000,
            },
          },
        },
        include: { payment_account: true },
      });
    });

    afterEach(async () => {
      await prismaClient.user.deleteMany();
    });

    test("Withdraw success", async () => {
      const user = await server.inject({
        method: "POST",
        url: "api/users/login",
        body: {
          username: "rifkiari",
          password: "rifkiari",
        },
      });

      const userResponse = JSON.parse(user.body);
      const accessToken = userResponse.data.accessToken;

      const result = await server.inject({
        method: "POST",
        url: "api/transactions/withdraw",
        body: {
          from: "1111-2222-3333-4444",
          amount: 2_000_000,
        },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const resultBody = JSON.parse(result.body);

      const paymentAccount = await prismaClient.paymentAccount.findFirst({
        where: {
          account_number: "1111-2222-3333-4444",
        },
      });

      expect(result.statusCode).toBe(200);
      expect(resultBody.errors).toBeUndefined();
      expect(resultBody.data).toBeDefined();
      expect(paymentAccount?.balance).toEqual(3_000_000);
    });

    test("Withdraw failed if token not provided", async () => {
      const result = await server.inject({
        method: "POST",
        url: "api/transactions/withdraw",
        body: {
          from: "1111-2222-3333-4444",
          amount: 2_000_000,
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(401);
      expect(resultBody.data).toBeUndefined();
      expect(resultBody.errors).toEqual("Unauthorized");
    });

    test("Withdraw failed if bad request", async () => {
      const user = await server.inject({
        method: "POST",
        url: "api/users/login",
        body: {
          username: "rifkiari",
          password: "rifkiari",
        },
      });

      const userResponse = JSON.parse(user.body);
      const accessToken = userResponse.data.accessToken;

      const result = await server.inject({
        method: "POST",
        url: "api/transactions/withdraw",
        body: {
          from: "",
          amount: 0,
        },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(400);
      expect(resultBody.data).toBeUndefined();
      expect(resultBody.errors).toBeDefined();
    });

    test("Transfer failed if account payment not found in user", async () => {
      const user = await server.inject({
        method: "POST",
        url: "api/users/login",
        body: {
          username: "rifkiari",
          password: "rifkiari",
        },
      });

      const userResponse = JSON.parse(user.body);
      const accessToken = userResponse.data.accessToken;

      const result = await server.inject({
        method: "POST",
        url: "api/transactions/withdraw",
        body: {
          from: "2255-4445-9999-0123",
          amount: 2_000_000,
        },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(404);
      expect(resultBody.data).toBeUndefined();
      expect(resultBody.errors).toEqual(
        "account number not found for this user"
      );
    });

    test("Withdraw failed if insufficient balance", async () => {
      const user = await server.inject({
        method: "POST",
        url: "api/users/login",
        body: {
          username: "rifkiari",
          password: "rifkiari",
        },
      });

      const userResponse = JSON.parse(user.body);
      const accessToken = userResponse.data.accessToken;

      const result = await server.inject({
        method: "POST",
        url: "api/transactions/withdraw",
        body: {
          from: "1111-2222-3333-4444",
          amount: 20_000_000,
        },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(400);
      expect(resultBody.data).toBeUndefined();
      expect(resultBody.errors).toBeDefined();
    });
  });
});
