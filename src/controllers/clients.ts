import prisma from "../helpers/prisma";
import { ResponseClass } from "../helpers/responseClass";

class ClientClass {
  private _map: Map<string, any>;
  public get map(): Map<string, any> {
    return this._map;
  }
  public set map(value: Map<string, any>) {
    this._map = value;
  }

  constructor(params) {
    const map: Map<string, any> = new Map(Object.entries(params));
    map.set("id", Number(map.get("id")));
    map.set("usersId", Number(map.get("usersId")));
    this.map = map;

    const privilages: Array<any> = this.map.get("clientPrivilages");
    for (let index = 0; index < privilages.length; index++) {
      const privilage = privilages[index];
      privilage.id = Number(privilage.id);
      privilage.resource.id = Number(privilage.resource.id);
      privilage.resourcesId = Number(privilage.resourcesId);
      privilage.clientsId = Number(privilage.clientsId);
      privilages[index] = privilage;
    }
    map.set("clientPrivilages", privilages);
  }

  toJSON() {
    const map = this.map;
    return Object.fromEntries(map);
  }
}

export const createClient = async (
  clientName: string,
  clientHost: string,
  clientPublicKeyEndpoint: string,
  usersId: number,
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
        clientName,
        clientHost,
        clientPublicKeyEndpoint,
        usersId,
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
      clientId: newClient.clientId,
      clientName: newClient.clientName,
      clientHost: newClient.clientHost,
      clientPublicKeyEndpoint: newClient.clientPublicKeyEndpoint,
      createdAt: newClient.createdAt,
      createdBy: Number(newClient.usersId),
    },
    privilages: privilages,
  };
  responseObject.message = "new client created";
  return responseObject;
};

export const readClient = async (clientId: string) => {
  const client = await prisma.clients
    .findUnique({
      where: {
        clientId,
      },
      include: {
        clientPrivilages: {
          include: {
            resource: {
              select: {
                resourceName: true,
                id: true,
              },
            },
          },
        },
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  const responseObject = new ResponseClass();

  if (client instanceof Error) {
    responseObject.status = 500;
    responseObject.message = `an unexpected error occred in retrieving client: ${client.message}`;
    responseObject.data = {
      error: client,
    };
    return responseObject;
  }

  if (client === null) {
    responseObject.status = 404;
    responseObject.message = `no client found for client_id ${clientId}`;
    responseObject.data = {
      client: null,
    };
    return responseObject;
  }

  responseObject.status = 200;
  responseObject.data = {
    client: new ClientClass(client),
  };
  responseObject.message = `client found for client_id ${clientId}`;
  return responseObject;
};

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
        clientId,
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
