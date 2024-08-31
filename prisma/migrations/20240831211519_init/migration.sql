-- CreateEnum
CREATE TYPE "profiles_role" AS ENUM ('client', 'contractor');

-- CreateEnum
CREATE TYPE "contracts_status" AS ENUM ('new', 'in_progress', 'terminated');

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "uuid" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "profession" VARCHAR(50) NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "role" "profiles_role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" SERIAL NOT NULL,
    "uuid" VARCHAR(50) NOT NULL,
    "client_id" INTEGER NOT NULL,
    "contractor_id" INTEGER NOT NULL,
    "terms" TEXT NOT NULL,
    "status" "contracts_status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "uuid" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "is_paid" BOOLEAN NOT NULL,
    "paid_date" TIMESTAMP(3) NOT NULL,
    "contract_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_uuid_key" ON "profiles"("uuid");

-- CreateIndex
CREATE INDEX "profiles_profession_role_idx" ON "profiles"("profession", "role");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_uuid_key" ON "contracts"("uuid");

-- CreateIndex
CREATE INDEX "contracts_client_id_contractor_id_idx" ON "contracts"("client_id", "contractor_id");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_uuid_key" ON "jobs"("uuid");

-- CreateIndex
CREATE INDEX "jobs_contract_id_idx" ON "jobs"("contract_id");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
