# Contract and Payment Service

## Overview

This project is a case study of a Contract and Payment Service, designed to validate core skills and competencies essential for the role of Payment Engineer. The service handles the creation and management of contracts and payments between clients and contractors, ensuring secure and efficient transactions. The project includes key functionalities such as handling transactions and locks, race condition management, concurrency at scale, and efficient database querying.

## Stack

The project uses the following technology stack:

- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **PostgreSQL**: A powerful, open-source object-relational database system.

## Models

### Profile Model

Profiles are categorized as either clients or contractors. Clients create contracts with contractors, who perform jobs under these contracts and receive payments. Each profile has a `balance` property to manage their available funds.

### Contract Model

Contracts represent the agreement between clients and contractors. Contracts have three statuses: `new`, `in_progress`, and `terminated`. Only contracts with the `in_progress` status are considered active. Contracts group individual jobs within them.

### Job Model

Jobs represent tasks that contractors perform under a contract. Contractors receive payment for completed jobs, which are linked to specific contracts.

## API Endpoints

The following endpoints are implemented:

- **GET `/contracts/:id`**: Returns a contract only if it is associated with the profile making the request.

- **GET `/contracts`**: Returns a list of contracts associated with a user (either a client or contractor). Only active contracts (not terminated) are included.

- **GET `/jobs/unpaid`**: Returns all unpaid jobs for a user (either a client or contractor) under active contracts only.

- **POST `/jobs/:job_id/pay`**: Allows a client to pay for a job if their balance is sufficient. The payment amount is transferred from the client's balance to the contractor's balance.

- **POST `/balances/deposit/:userId`**: Deposits funds into a client's balance. The deposit is restricted to a maximum of 25% of the client's total outstanding payments for jobs at the time of deposit.

- **GET `/admin/best-profession?start=<date>&end=<date>`**: Returns the profession that earned the most money within the specified date range.

- **GET `/admin/best-clients?start=<date>&end=<date>&limit=<integer>`**: Returns the clients who paid the most for jobs within the specified date range. The query includes a limit parameter, with the default set to 2.

## Authentication

Authentication is handled via middleware that retrieves a user profile from the database based on a profile ID provided in the request headers. If no profile is found, the middleware responds with a 401 Unauthorized status.

## Database Schema

The database schema includes the following tables:

- **Profiles**: Stores client and contractor profiles.
- **Contracts**: Manages contracts between clients and contractors.
- **Jobs**: Tracks jobs performed under contracts, including payment details.

The schema uses the following ENUM types:

- `profiles_role`: Defines the role of a profile as either `client` or `contractor`.
- `contracts_status`: Defines the status of a contract as `new`, `in_progress`, or `terminated`.

## Data Seeding

The data seeding function `createProfilesWithContractsAndJobsp` creates profiles, contracts, and jobs to test various functionalities:

- **Best Client**: A client with high-value contracts and multiple payments.
- **Best Profession**: Contractors with different professions and varying job payments.
- **Contract Management**: Different contract statuses (`new`, `in_progress`, `terminated`) and associated jobs.

This seeding ensures the database is populated with sufficient data to test core features of the service.

## Testing

The service includes comprehensive unit tests to validate functionality, including:

- **Profile Creation**: Verifies profile creation for clients and contractors.
- **Contract and Job Management**: Ensures contracts and jobs are created, queried, and updated correctly.
- **Payment Handling**: Tests payment transactions, including balance updates and payment restrictions.
- **Best Client and Profession**: Validates the queries that determine the best client and profession within a specified date range.

## Getting Started

To set up the project locally, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd contract-payment-service
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up the Database**:

   Configure PostgreSQL and update the `.env` file with the correct database connection details.
   Run migrations to set up the database schema:

   ```bash
   npx prisma migrate dev
   ```

4. **Seed the Database**:

   Seed the database with initial data:

   ```bash
   npm run seed
   ```

5. **Start the Application**:

   ```bash
   npm run start:dev
   ```

6. **Run Tests**:
   ```bash
   npm run test
   ```

To set up the project using docker, follow these steps:

### Docker Commands

- **Start Docker Containers:**

  ```bash
  npm run docker:start
  ```

- **Stop Docker Containers:**

  ```bash
  npm run docker:stop
  ```

- **Run Tests in Docker Container:**

  ```bash
  npm run docker:test:start
  npm run docker:test:exec
  ```

### Testing

- **Run All Tests:**

  ```bash
  npm run test
  ```

## Conclusion

This project demonstrates the implementation of a robust contract and payment service, handling critical operations such as transaction management, concurrency, and secure payment processing. The service is designed to be scalable, efficient, and easy to maintain, making it a solid foundation for any payment-oriented application.
