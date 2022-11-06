import prisma from "../helpers/prisma";

export const createClient = async (
  clientName: string,
  clientHost: string,
  clientPublicKeyEndpoint: string,
  userId: number
) => {
  const newClient = await prisma.clients
    .create({
      data: {
        client_name: clientName,
        client_host: clientHost,
        client_public_key_endpoint: clientPublicKeyEndpoint,
        users_id: userId,
      },
    })
    .catch((e) => {
      throw e;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  return {
    status: 200,
    message: "new client created",
    data: {
      client: {
        id: Number(newClient.id),
        clientId: newClient.client_id,
        clientName: newClient.client_name,
        clientHost: newClient.client_host,
        clientPublicKeyEndpoint: newClient.client_public_key_endpoint,
        createdAt: newClient.created_at,
        createdBy: Number(newClient.users_id),
      },
    },
  };
};

export const readClient = async () => {};

export const updateClient = async () => {};

export const deleteClient = async () => {};

export const getClientById = async (id: number) => {
  if (!id) {
    return {
      status: 400,
      data: null,
      message: "client id is required",
    };
  }

  const client = await prisma.clients
    .findUnique({
      where: {
        id,
      },
    })
    .catch((e) => {
      throw e;
    })
    .finally(async () => {
      await prisma.$disconnect;
    });

  return {
    status: 200,
    data: { client },
    message: `client found with ${id}`,
  };
};

export const getClientByClientId = async (clientId: string) => {
  if (!clientId) {
    return {
      status: 400,
      data: null,
      message: "client id is required",
    };
  }

  const client = await prisma.clients
    .findUnique({
      where: {
        client_id: clientId,
      },
    })
    .catch((e) => {
      throw e;
    })
    .finally(async () => {
      await prisma.$disconnect;
    });

  return {
    status: 200,
    data: { client },
    message: `client found with ${clientId}`,
  };
};
