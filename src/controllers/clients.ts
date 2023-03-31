import prisma from "../helpers/prisma";
import { ResponseClass } from "../helpers/responseClass";

// Basic client class
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
    map.set("createdUserId", Number(map.get("createdUserId")));
    map.set("updatedUserId", Number(map.get("updatedUserId")));
    map.set("fhirServersId", Number(map.get("fhirServersId")));
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

/**
 * Registers a new fhir client communicating with the fhir server
 *
 * @param clientName name of the client
 * @param clientHost host address of the client
 * @param clientPublicKeyEndpoint public endpoint url of the client
 * @param usersId userid of ther user creating the client
 * @param clientDescription basic description of the client
 * @param batchRequests whether client accept batch requests
 * @param globalSearch whether client accept global search
 * @param privilages fhir resource privilates for the client
 * @param fhirEndpoint fhir endpoint mapping the client
 * @param isActive whether client is active or retired
 * @returns response object with status code 200 with client details if client created or status code if client not created
 */
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
  fhirEndpoint: number,
  isActive: boolean
) => {
  // creates new client in database
  const newClient = await prisma.clients
    .create({
      data: {
        clientName,
        clientHost,
        clientPublicKeyEndpoint,
        createdUserId: usersId,
        updatedUserId: usersId,
        fhirServersId: fhirEndpoint,
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

  // if creation was an error return error response class
  if (newClient instanceof Error) {
    responseObject.data = newClient;
    responseObject.message = `error creating new client`;
    responseObject.status = 500;
    return responseObject;
  }

  // array stroing privilages
  const parsePrivilages: Array<{
    resourcesId: bigint;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    search: boolean;
    clientsId: bigint;
  }> = [];

  // parse privilages
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
      create: false,
      read: false,
      update: false,
      delete: false,
      search: false,
      clientsId: BigInt(0),
      resourcesId: BigInt(0),
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

  // populate the privilages table with privilage data and link to client
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

  // return response object if error creating privilages
  if (createPrivilages instanceof Error) {
    responseObject.status = 500;
    responseObject.data = createPrivilages;
    responseObject.message = `error creating resource privilages`;
    return responseObject;
  }

  // if everthing works, return status code 200 with client data
  responseObject.status = 200;
  responseObject.data = {
    client: {
      id: Number(newClient.id),
      clientId: newClient.clientId,
      clientName: newClient.clientName,
      clientHost: newClient.clientHost,
      clientPublicKeyEndpoint: newClient.clientPublicKeyEndpoint,
      createdAt: newClient.createdAt,
      createdBy: Number(newClient.createdUserId),
    },
    privilages: privilages,
  };
  responseObject.message = "new client created";
  return responseObject;
};

/**
 *
 * @param clientId client UUID
 * @returns responseObject with status code 200, 410, 404 or 500
 */
export const readClient = async (clientId: string) => {
  // find client from database
  const client = await prisma.clients
    .findUnique({
      where: {
        clientId,
      },
      include: {
        fhirServer: {
          select: {
            fhirServerEndpoint: true,
            fhirServerName: true,
          },
        },
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

  // if error return response object with status code 500
  if (client instanceof Error) {
    responseObject.status = 500;
    responseObject.message = `an unexpected error occred in retrieving client: ${client.message}`;
    responseObject.data = {
      error: client,
    };
    return responseObject;
  }

  // if client does not exists resutn responseObject with status code 404
  if (client === null) {
    responseObject.status = 404;
    responseObject.message = `no client found for client_id ${clientId}`;
    responseObject.data = {
      client: null,
    };
    return responseObject;
  }

  // if client is deleted return responseObject with status code 410
  if (client.retired === true) {
    responseObject.status = 410;
    responseObject.data = null;
    responseObject.message = `client deleted on ${client.updatedAt}`;
    return responseObject;
  }

  // if client exists, return responseObject with status code 200
  responseObject.status = 200;
  responseObject.data = {
    client: new ClientClass(client),
  };
  responseObject.message = `client found for client_id ${clientId}`;
  return responseObject;
};

/**
 *
 * @param clientsId client id
 * @param clientName client name
 * @param clientHost client host
 * @param clientPublicKeyEndpoint client public key endpoint
 * @param usersId updating user id
 * @param clientDescription client description
 * @param batchRequests whether client accept batch requests
 * @param globalSearch whether client accept global search parameters
 * @param privilages client fhir resource priviladges
 * @param fhirEndpoint fhir server endpoint
 * @param isActive active or retured
 * @returns response object with status code 200, 500,
 */
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
  fhirEndpoint: number,
  isActive: boolean
) => {
  // search the database for client
  const checkClient = await prisma.clients
    .findUnique({
      where: {
        id: clientsId,
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  // return responseObject with status code 500 if error occured
  if (checkClient instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = {
      error: checkClient,
    };
    responseObject.message = checkClient.message;
    return responseObject;
  }

  // return response object with status 404 if client does not exists
  if (!checkClient) {
    const responseObject = new ResponseClass();
    responseObject.status = 404;
    responseObject.data = {
      error: "client does not exist",
    };
    responseObject.message = `client does not exists for client id ${clientsId}`;
    return responseObject;
  }

  // return responseObject with status code 410 if client is retired
  if (checkClient.retired === true) {
    const responseObject = new ResponseClass();
    responseObject.status = 410;
    responseObject.data = null;
    responseObject.message = `the with id ${checkClient.clientId} client was deleted on ${checkClient.updatedAt}`;
    return responseObject;
  }

  // update client details
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
        updatedUserId: usersId,
        fhirServersId: fhirEndpoint,
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

  // return responseObject with status code 500 if client update failed
  if (updateClient instanceof Error) {
    responseObject.status = 500;
    responseObject.data = {
      error: updateClient,
    };
    responseObject.message = updateClient.message;
    return responseObject;
  }

  // add all privilages of the existing client to tobe deleted array
  const toBeDeleted: number[] = [];

  // populate the tobe deleted array with exisiting client privilages
  updateClient.clientPrivilages.forEach((privilage) => {
    toBeDeleted.push(Number(privilage.id));
  });

  // loop through new priviladges
  privilages.forEach(async (privilage) => {
    // remove updating priviladges from tobedeleted array
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

    // priviladge exists update priviladges
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
      // if does not exists, create new priviladges
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

  // delete the remaining privialdges of the tobedeleted array
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

  // return status code 200 for success
  responseObject.status = 200;
  responseObject.data = {
    client: new ClientClass(updateClient),
    privilages,
  };
  responseObject.message = "client successfully updated";
  return responseObject;
};

/**
 *
 * @param id clientId
 * @param usersId user deleting the client
 * @returns response object with status code 200, 500
 */
export const deleteClient = async (id: number, usersId: number) => {
  // find client from database and retire client
  const client = await prisma.clients
    .update({
      where: { id },
      data: {
        retired: true,
        updatedUserId: usersId,
        updatedAt: new Date().toISOString(),
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  // if error fetching client return responseobject with status code 200
  if (client instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = { error: client };
    responseObject.message = client.message;
    return responseObject;
  }

  // return responseObject with status code 200 after deleting client

  const responseObject = new ResponseClass();
  responseObject.status = 200;
  responseObject.message = `client deleted with ID ${id}`;
  responseObject.data = { client: new ClientClass(client) };
  return responseObject;
};

/**
 *
 * @param id clientid
 * @returns responseObject with status code 404, 200
 */
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
      include: {
        fhirServer: {
          select: {
            fhirServerEndpoint: true,
            fhirServerName: true,
          },
        },
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
      skip: skip * take,
      take,
      where: {
        retired: false,
      },
      include: {
        fhirServer: {
          select: {
            fhirServerEndpoint: true,
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

  if (clients instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = {
      error: clients,
    };
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

export const searchClient = async (query: string) => {
  const clients = await prisma.clients
    .findMany({
      where: {
        OR: [
          {
            clientDescription: {
              startsWith: query,
            },
          },
          {
            clientName: {
              startsWith: query,
            },
          },
        ],
        AND: {
          retired: false,
        },
      },
      include: {
        fhirServer: {
          select: {
            fhirServerEndpoint: true,
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

  if (clients instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = {
      error: clients,
    };
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
    query,
    results: tempClients.length,
  };
  responseObject.message = `${tempClients.length} client[s] found`;
  return responseObject;
};
