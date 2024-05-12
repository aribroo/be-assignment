import { FastifySchema } from "fastify";

export const registerUserSchema: FastifySchema = {
  tags: ["User"],
  summary: "Register a new user",
  description: "Endpoint to register a new user",
  body: {
    type: "object",
    properties: {
      username: { type: "string" },
      password: { type: "string" },
      payment_account: {
        type: "object",
        properties: {
          account_number: { type: "string" },
          type: { type: "string" },
          balance: { type: "number" },
        },
      },
    },
    required: ["username", "password"],
  },
  response: {
    201: {
      type: "object",
      description: "Return a data user if success register",
      properties: {
        data: {
          type: "object",
          properties: {
            id: { example: 1 },
            username: { type: "string", example: "johndoe" },
            payment_account: {
              type: "array",
              items: {
                example: {
                  account_number: "1111-2222-3333-4444",
                  user_id: 1,
                  type: "DEBIT",
                  balance: 5000000,
                },
              },
            },
          },
        },
      },
    },
  },
};

export const loginrUserSchema: FastifySchema = {
  tags: ["User"],
  summary: "Login user",
  description: "Endpoint to login user",
  body: {
    type: "object",
    properties: {
      username: { type: "string" },
      password: { type: "string" },
    },
    required: ["username", "password"],
  },
  response: {
    200: {
      type: "object",
      description: "Return an access token if success login",
      properties: {
        data: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
            },
          },
        },
      },
    },
  },
};

export const getPaymentAccountSchema: FastifySchema = {
  tags: ["User"],
  summary: "Get payment accounts",
  description: "Endpoint to get all user payment account",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string", description: "JWT Bearer Token" },
    },
    required: ["Authorization"],
  },
  response: {
    200: {
      type: "object",
      description: "Return a list of payment account",
      properties: {
        data: {
          type: "array",
          items: {
            example: {
              account_number: "1111-2222-3333-4444",
              type: "DEBIT",
              balance: 5000000,
            },
          },
        },
      },
    },
  },
};
