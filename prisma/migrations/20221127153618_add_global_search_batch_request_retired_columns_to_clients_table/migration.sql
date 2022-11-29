/*
  Warnings:

  - Added the required column `clientDescription` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enableBatchRequests` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enableGlobalSearch` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "clientDescription" TEXT NOT NULL,
ADD COLUMN     "enableBatchRequests" BOOLEAN NOT NULL,
ADD COLUMN     "enableGlobalSearch" BOOLEAN NOT NULL,
ADD COLUMN     "retired" BOOLEAN NOT NULL DEFAULT false;
