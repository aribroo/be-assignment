import { ACCOUNT_TYPE } from "@prisma/client";
import { prismaClient } from "../src/database/db";
import { server } from "../src/index";
import PasswordUtil from "../src/utils/password";

afterAll(async () => {
  await server.close();
});

describe("API users", () => {
  describe("POST api/users/register", () => {
    afterEach(async () => {
      await prismaClient.user.deleteMany();
    });

    test("Register new user", async () => {
      const result = await server.inject({
        method: "POST",
        url: "api/users/register",
        body: {
          username: "rifkiari",
          password: "rifkiari",
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(201);
      expect(resultBody.data.username).toEqual("rifkiari");
    });

    test("Register new user with payment acount", async () => {
      const result = await server.inject({
        method: "POST",
        url: "api/users/register",
        body: {
          username: "rifkiari",
          password: "rifkiari",
          payment_account: {
            account_number: "1111-2222-3333-4444",
            type: "DEBIT",
            balance: 5000000,
          },
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(201);
      expect(resultBody.data.username).toEqual("rifkiari");
      expect(resultBody.data.payment_account.length).toEqual(1);
    });

    test("Failed register user if bad request", async () => {
      const result = await server.inject({
        method: "POST",
        url: "api/users/register",
        body: {
          username: "",
          password: "",
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(400);
      expect(resultBody.errors).toBeDefined();
    });
  });

  describe("POST api/users/login", () => {
    beforeEach(async () => {
      await prismaClient.user.create({
        data: {
          username: "rifkiari",
          password: await PasswordUtil.hash("rifkiari"),
        },
      });
    });

    afterEach(async () => {
      await prismaClient.user.deleteMany();
    });

    test("Login user", async () => {
      const result = await server.inject({
        method: "POST",
        url: "api/users/login",
        body: {
          username: "rifkiari",
          password: "rifkiari",
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(200);
      expect(resultBody.data.accessToken).toBeDefined();
    });

    test("Failed login user", async () => {
      const result = await server.inject({
        method: "POST",
        url: "api/users/login",
        body: {
          username: "wrongname",
          password: "wrongpassword",
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(400);
      expect(resultBody.errors).toBeDefined();
      expect(resultBody.errors).toEqual("username or password is wrong");
    });
  });

  describe("GET api/users/payment-accounts", () => {
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

    test("Unauthorized if token not provided", async () => {
      const result = await server.inject({
        method: "GET",
        url: "api/users/payment-accounts",
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(401);
      expect(resultBody.data).toBeUndefined();
      expect(resultBody.errors).toEqual("Unauthorized");
    });

    test("Get payment accounts", async () => {
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
        method: "GET",
        url: "api/users/payment-accounts",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const resultBody = JSON.parse(result.body);

      expect(result.statusCode).toBe(200);
      expect(resultBody.errors).toBeUndefined();
      expect(resultBody.data[0].account_number).toEqual("1111-2222-3333-4444");
      expect(resultBody.data[0].balance).toEqual(5000000);
    });
  });
});
