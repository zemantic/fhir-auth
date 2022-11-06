-- CreateTable
CREATE TABLE "clients" (
    "id" BIGSERIAL NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_host" TEXT NOT NULL,
    "client_public_key_endpoint" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_client_id_key" ON "clients"("client_id");
