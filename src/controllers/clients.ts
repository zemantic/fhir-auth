import prisma from "../helpers/prisma";
import { ResponseClass } from "../helpers/responseClass";

export const createClient = async (
  clientName: string,
  clientHost: string,
  clientPublicKeyEndpoint: string,
  userId: number,
  privilages: Array<{
    resource: string;
    resourcesId: number;
    privilages: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      search: boolean;
    };
  }>
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

  const responseObject = new ResponseClass();

  if (newClient instanceof Error) {
    responseObject.data = newClient;
    responseObject.message = `error creating new client`;
    responseObject.status = 500;
    return responseObject;
  }

  const parsePrivilages: Array<{
    resourcesId: bigint;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    search: boolean;
    clientsId: bigint;
  }> = [];

  privilages.forEach((privilage) => {
    let tempPrivilage: {
      resourcesId: bigint;
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      search: boolean;
      clientsId: bigint;
    } = {
      resourcesId: BigInt(0),
      create: false,
      read: false,
      update: false,
      delete: false,
      search: false,
      clientsId: BigInt(0),
    };

    tempPrivilage.create = privilage.privilages.create;
    tempPrivilage.read = privilage.privilages.read;
    tempPrivilage.update = privilage.privilages.update;
    tempPrivilage.delete = privilage.privilages.delete;
    tempPrivilage.search = privilage.privilages.search;
    tempPrivilage.clientsId = newClient.id;
    tempPrivilage.resourcesId = BigInt(privilage.resourcesId);

    parsePrivilages.push(tempPrivilage);
  });

  const createPrivilages = await prisma.clientPrivilages
    .createMany({
      data: parsePrivilages,
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  if (createPrivilages instanceof Error) {
    responseObject.status = 500;
    responseObject.data = createPrivilages;
    responseObject.message = `error creating resource privilages`;
    return responseObject;
  }

  responseObject.status = 200;
  responseObject.data = {
    client: {
      id: Number(newClient.id),
      clientId: newClient.client_id,
      clientName: newClient.client_name,
      clientHost: newClient.client_host,
      clientPublicKeyEndpoint: newClient.client_public_key_endpoint,
      createdAt: newClient.created_at,
      createdBy: Number(newClient.users_id),
    },
    privilages: privilages,
  };
  responseObject.message = "new client created";
  return responseObject;
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
