/*
  Warnings:

  - You are about to drop the column `fhirEndpoint` on the `clients` table. All the data in the column will be lost.
  - Added the required column `fhirServersId` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maturityStatus` to the `resources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "fhirEndpoint",
ADD COLUMN     "fhirServersId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "fhirServers" ADD COLUMN     "retired" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "maturityStatus" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_fhirServersId_fkey" FOREIGN KEY ("fhirServersId") REFERENCES "fhirServers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
