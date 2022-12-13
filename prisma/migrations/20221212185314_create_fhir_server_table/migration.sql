/*
  Warnings:

  - You are about to drop the column `usersId` on the `clients` table. All the data in the column will be lost.
  - Added the required column `createdUserId` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedUserId` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_usersId_fkey";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "usersId",
ADD COLUMN     "createdUserId" BIGINT NOT NULL,
ADD COLUMN     "updatedUserId" BIGINT NOT NULL;

-- CreateTable
CREATE TABLE "fhirServers" (
    "id" BIGSERIAL NOT NULL,
    "serverId" TEXT NOT NULL,
    "fhirServerName" TEXT NOT NULL,
    "fhirServerDescription" TEXT,
    "fhirServerEndpoint" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdUserId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedUserId" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "settings" (
    "id" BIGSERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "fhirServers_id_key" ON "fhirServers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "fhirServers_serverId_key" ON "fhirServers"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_id_key" ON "settings"("id");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fhirServers" ADD CONSTRAINT "fhirServers_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fhirServers" ADD CONSTRAINT "fhirServers_updatedUserId_fkey" FOREIGN KEY ("updatedUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
