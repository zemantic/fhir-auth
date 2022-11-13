-- CreateTable
CREATE TABLE "clientPrivilages" (
    "id" BIGSERIAL NOT NULL,
    "create" BOOLEAN NOT NULL,
    "read" BOOLEAN NOT NULL,
    "update" BOOLEAN NOT NULL,
    "delete" BOOLEAN NOT NULL,
    "search" BOOLEAN NOT NULL,
    "clientsId" BIGINT NOT NULL,
    "resourcesId" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "resources" (
    "id" BIGSERIAL NOT NULL,
    "resource_name" TEXT NOT NULL,
    "fhir_version" DECIMAL(65,30) NOT NULL,
    "is_active" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "clientPrivilages_id_key" ON "clientPrivilages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "resources_id_key" ON "resources"("id");

-- AddForeignKey
ALTER TABLE "clientPrivilages" ADD CONSTRAINT "clientPrivilages_clientsId_fkey" FOREIGN KEY ("clientsId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientPrivilages" ADD CONSTRAINT "clientPrivilages_resourcesId_fkey" FOREIGN KEY ("resourcesId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
