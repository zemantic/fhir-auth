-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" BIGSERIAL NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientHost" TEXT NOT NULL,
    "clientPublicKeyEndpoint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usersId" BIGINT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

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
    "resourceName" TEXT NOT NULL,
    "fhirVersion" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_clientId_key" ON "clients"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "clientPrivilages_id_key" ON "clientPrivilages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "resources_id_key" ON "resources"("id");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientPrivilages" ADD CONSTRAINT "clientPrivilages_clientsId_fkey" FOREIGN KEY ("clientsId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientPrivilages" ADD CONSTRAINT "clientPrivilages_resourcesId_fkey" FOREIGN KEY ("resourcesId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
