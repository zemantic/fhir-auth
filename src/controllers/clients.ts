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
    if (privilages) {
      for (let index = 0; index < privilages.length; index++) {
        const privilage = privilages[index];
        if (privilage.id) privilage.id = Number(privilage.id);
        if (privilage.resource.id)
          privilage.resource.id = Number(privilage.resource.id);
        if (privilage.resourcesId)
          privilage.resourcesId = Number(privilage.resourcesId);
        if (privilage.clientsId)
          privilage.clientsId = Number(privilage.clientsId);
        privilages[index] = privilage;
      }
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
  clientDescription: string,
  batchRequests: boolean,
  globalSearch: boolean,
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
  }>,
  fhirEndpoint: string,
  isActive: boolean
) => {
  const newClient = await prisma.clients
    .create({
      data: {
        clientName,
        clientHost,
        clientPublicKeyEndpoint,
        usersId,
        fhirEndpoint,
        isActive: isActive,
        clientDescription,
        enableBatchRequests: batchRequests,
        enableGlobalSearch: globalSearch,
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

export const updateClient = async (
  clientsId: number,
  clientName: string,
  clientHost: string,
  clientPublicKeyEndpoint: string,
  usersId: number,
  clientDescription: string,
  batchRequests: boolean,
  globalSearch: boolean,
  privilages: Array<{
    resource: string;
    resourcesId: number;
    id: number;
    privilages: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      search: boolean;
    };
  }>,
  fhirEndpoint: string,
  isActive: boolean
) => {
  const updateClient = await prisma.clients
    .update({
      where: {
        id: clientsId,
      },
      data: {
        clientName,
        clientHost,
        clientPublicKeyEndpoint,
        clientDescription,
        updatedAt: new Date().toISOString(),
        usersId,
        fhirEndpoint,
        isActive,
        enableBatchRequests: batchRequests,
        enableGlobalSearch: globalSearch,
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

  if (updateClient instanceof Error) {
    responseObject.status = 500;
    responseObject.data = {
      error: updateClient.message,
    };
    responseObject.message = updateClient.message;
    return responseObject;
  }

  const toBeDeleted: number[] = [];

  updateClient.clientPrivilages.forEach((privilage) => {
    toBeDeleted.push(Number(privilage.id));
  });

  privilages.forEach(async (privilage) => {
    toBeDeleted.splice(toBeDeleted.indexOf(privilage.id), 1);

    const findPrivilage = await prisma.clientPrivilages
      .findFirst({
        where: {
          clientsId,
          resourcesId: privilage.resourcesId,
        },
      })
      .catch((e) => {
        throw e;
      })
      .finally(async () => {
        await prisma.$disconnect();
      });

    if (findPrivilage) {
      await prisma.clientPrivilages.update({
        where: {
          id: findPrivilage.id,
        },
        data: {
          create: privilage.privilages.create,
          update: privilage.privilages.update,
          read: privilage.privilages.read,
          delete: privilage.privilages.delete,
          search: privilage.privilages.search,
        },
      });
    } else {
      await prisma.clientPrivilages
        .create({
          data: {
            create: privilage.privilages.create,
            update: privilage.privilages.update,
            read: privilage.privilages.read,
            delete: privilage.privilages.delete,
            search: privilage.privilages.search,
            clientsId,
            resourcesId: privilage.resourcesId,
          },
        })
        .catch((e) => {
          throw e;
        })
        .finally(async () => {
          await prisma.$disconnect();
        });
    }
  });

  await prisma.clientPrivilages
    .deleteMany({
      where: {
        id: {
          in: toBeDeleted,
        },
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  responseObject.status = 200;
  responseObject.data = {
    client: new ClientClass(updateClient),
    privilages,
  };
  responseObject.message = "client successfully updated";
  return responseObject;
};

export const deleteClient = async (
  id: number,
  clientId: string,
  usersId: number
) => {
  const client = await prisma.clients
    .update({
      where: { id, clientId },
      data: {
        retired: true,
        usersId: usersId,
        updatedAt: new Date().toISOString(),
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  if (client instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = { error: client };
    responseObject.message = client.message;
    return responseObject;
  }

  const responseObject = new ResponseClass();
  responseObject.status = 200;
  responseObject.message = `client deleted with ID ${id ?? clientId}`;
  responseObject.data = { client: new ClientClass(client) };
  return responseObject;
};

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

export const getAllClients = async (skip: number, take: number) => {
  const clients = await prisma.clients
    .findMany({
      skip,
      take,
      where: {
        retired: false,
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  if (clients instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = null;
    responseObject.message = clients.message;
    return responseObject;
  }

  const tempClients: ClientClass[] = [];

  clients.forEach((client) => {
    const tempClient = new ClientClass(client);
    tempClients.push(tempClient);
  });

  const responseObject = new ResponseClass();
  responseObject.status = 200;
  responseObject.data = {
    clients: tempClients,
    skip,
    take,
  };
  responseObject.message = `${tempClients.length} client[s] fetched`;

  return responseObject;
};
