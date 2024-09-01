/*
  Warnings:

  - You are about to alter the column `price` on the `jobs` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `balance` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "jobs" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "balance" SET DEFAULT 0.0,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(10,2);
