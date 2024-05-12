# Take home assignment

This project consists of two backend services which manage user accounts and transactions. The Account Manager service is responsible for user management, payment accounts, and payment history. The Payment Manager service is responsible for transaction management.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Technology

- Node.Js
- Fastify
- PostgreSQL
- Prisma ORM
- Docker Compose
- Zod

### Prerequisites

Make sure you have the following software installed on your machine:

- Node.Js
- NPM (Node Package Manager)
- PostgreSQL
- Docker

### Installation

1. Clone the repository:

   ```bash
    git clone https://github.com/aribroo/be-assignment.git
   ```

2. Navigate into the project directory:
   ```bash
   cd be-assignment
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

1. Create a .env file in the root directory based on the provided .env.example file.
2. Update the environment variables in the .env file as per your configuration.

## Running the App

### Using Docker Compose

1. Make sure you have Docker and Docker Compose installed on your machine.
2. Open a terminal and navigate to the project directory.
3. Run the command docker-compose up to build and run Docker containers for the backend services.
   ```bash
   docker compose up
   ```
4. The services will be running on the port specified in the docker-compose.yml file (e.g., 3000).
5. Swagger documentation at http://host:port/docs (e.g., http://localhost:3000/docs)

### Without Docker Compose

1. Ensure that you have a Postgres database running on your local machine or remote server.

2. Update the database connection URL in the .env file.

3. Run Prisma migrations to create database tables:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Running the Server
   ```bash
   npm run dev
   ```
5. The services will be running on the port specified in the configuration (e.g., 3000).
6. Swagger documentation at http://host:port/docs (e.g., http://localhost:3000/docs)

## Usage

### Account Manager Service

- **Endpoint**: `/api/users/register`

  - **Method**: `POST`
  - **Description**: Register new user with username, password and payment account (optional).
  - **Example Payload**:
    ```json
    {
      "username": "example123",
      "password": "password123",
      "payment_account": {
        "account_number": "1111-2222-3333-4444",
        "type": "DEBIT",
        "balance": 5000000
      }
    }
    ```

- **Endpoint**: `/api/users/login`

  - **Method**: `POST`
  - **Description**: Login user with username and password. If the login is successful, an access token is provided.
  - **Example Payload**:
    ```json
    {
      "username": "example123",
      "password": "password123"
    }
    ```
  - **Example Response**:
    ```json
    {
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTYsInVzZXJuYW1lIjoiZGltYXNrZWNlIiwiaWF0IjoxNzE1NDYzNTc0LCJleHAiOjE3MTU1NDk5NzR9.gJN7itjYqDI6RZqqT-OT7tK_F5c2KA58U8B5Znch1uU"
      }
    }
    ```

- **Endpoint**: `/api/users/payment-accounts`

  - **Method**: `GET`
  - **Description**: Retrieve all payment accounts associated with the logged-in user. This endpoint requires authorization using a Bearer token (access token obtained during login).
  - **Example Header**:
    ```json
    {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTYsInVzZXJuYW1lIjoiZGltYXNrZWNlIiwiaWF0IjoxNzE1NDYzNTc0LCJleHAiOjE3MTU1NDk5NzR9.gJN7itjYqDI6RZqqT-OT7tK_F5c2KA58U8B5Znch1uU"
    }
    ```

### Payment Manager Service

- **Endpoint**: `/api/transactions/send`

  - **Method**: `POST`
  - **Description**: Transfer balance to another account. This endpoint requires authorization using a Bearer token (access token obtained during login).
  - **Example Payload**:
    ```json
    {
      "from": "1111-2222-3333-4444", // Sender's source payment account in the logged-in user's profile
      "to": "1234-5678-9999-0000", // Recipient's payment account
      "amount": 2000000 // Amount of balance to be sent
    }
    ```

- **Endpoint**: `/api/transactions/withdraw`

  - **Method**: `POST`
  - **Description**: Withdraw funds from the specified payment account. This endpoint requires authorization using a Bearer token (access token obtained during login).
  - **Example Payload**:
    ```json
    {
      "from": "1111-2222-3333-4444", // Source payment account
      "amount": 2000000 // Amount of balance to be withdrawn
    }
    ```

- **Endpoint**: `/api/transactions/payment-history`

  - **Method**: `GET`
  - **Description**: Retrieve the payment history associated with the logged-in user. This endpoint requires authorization using a Bearer token (access token obtained during login).
  - **Example Header**:
    ```json
    {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTYsInVzZXJuYW1lIjoiZGltYXNrZWNlIiwiaWF0IjoxNzE1NDYzNTc0LCJleHAiOjE3MTU1NDk5NzR9.gJN7itjYqDI6RZqqT-OT7tK_F5c2KA58U8B5Znch1uU"
    }
    ```

## Testing

For testing, I use [Jest](https://jestjs.io/), a delightful JavaScript Testing Framework with a focus on simplicity.

### Running Tests

You can run the tests by executing the following command in the terminal:

```bash
npm run test
```

## Seeding Initial Data with Prisma

If you need to seed initial data into your database before running application, You can run the tests by executing the following command in the terminal:

```bash
npx prisma db seed
```

## Compile TypeScript to JavaScript

To build the TypeScript code and copy it to the `dist` folder, you can run the following command:

```bash
npm run build
```

Start the server:

```bash
npm run start
```

## Built With

- [Fastify](https://github.com/fastify/fastify) - Fast, unopinionated, An efficient server implies a lower cost of the infrastructure.
- [Prisma](https://www.prisma.io/) - Database toolkit for TypeScript and Node.js.
- [Zod](https://github.com/colinhacks/zod) - TypeScript-first schema declaration and validation library.
