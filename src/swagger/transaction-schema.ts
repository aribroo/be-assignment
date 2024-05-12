import { TRANSACTION_STATUS } from "@prisma/client";
import { FastifySchema } from "fastify";

export const sendBalanceSchema: FastifySchema = {
  tags: ["Transaction"],
  summary: "Send balance",
  description: "Endpoint to send balance to another account payment",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string", description: "JWT Bearer Token" },
    },
    required: ["Authorization"],
  },
  body: {
    type: "object",
    properties: {
      from: { type: "string" },
      to: { type: "string" },
      amount: { type: "number" },
    },
  },
  response: {
    200: {
      type: "object",
      description: "Return a transaction result",
      properties: {
        data: {
          type: "object",
          example: {
            id: "1111-2222-3333-4444",
            amount: 2000000,
            to_address: "5555-4236-7895-3331",
            status: "SUCCESS",
            timestamp: "2024-05-11T21:54:16.042Z",
          },
        },
      },
    },
  },
};

export const withdrawSchema: FastifySchema = {
  tags: ["Transaction"],
  summary: "Withdraw",
  description: "Endpoint to withdraw balance from user payment account",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string", description: "JWT Bearer Token" },
    },
    required: ["Authorization"],
  },
  body: {
    type: "object",
    properties: {
      from: { type: "string" },
      amount: { type: "number" },
    },
  },
  response: {
    200: {
      type: "object",
      description: "Return a transaction result",
      properties: {
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            amount: { type: "string" },
            status: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
          },
          example: {
            id: "1111-2222-3333-4444",
            amount: 2000000,
            to_address: "5555-4236-7895-3331",
            status: TRANSACTION_STATUS.SUCCESS,
            timestamp: new Date().toISOString(),
          },
        },
      },
    },
  },
};

export const paymentHistorySchema: FastifySchema = {
  tags: ["Transaction"],
  summary: "Payment History",
  description: "Endpoint to get payment histories for user",
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
      description: "Return a payment histories",
      properties: {
        data: {
          type: "array",
          items: {
            properties: {
              id: { type: "string" },
              transaction_id: { type: "string" },
              account_number: { type: "string" },
              transaction: {
                type: "object",
                properties: {
                  amount: { type: "string" },
                  to_address: { type: "string" },
                  status: { type: "string" },
                  timestamp: { type: "string", format: "date-time" },
                },
              },
            },
            example: {
              id: 1,
              transaction_id: "01619dab-7bea-48e9-9ff4-84cf0d722e0f",
              account_number: "1333-8555-4441-9999",
              transaction: {
                amount: 2000000,
                to_address: "5555-4236-7895-3331",
                status: TRANSACTION_STATUS.SUCCESS,
                timestamp: new Date().toISOString(),
              },
            },
          },
        },
      },
    },
  },
};
