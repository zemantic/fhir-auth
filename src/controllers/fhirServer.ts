import prisma from "../helpers/prisma";
import { ResponseClass } from "../helpers/responseClass";

class FhirServerClass {
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
    this.map = map;
  }

  toJSON() {
    const map = this.map;
    return Object.fromEntries(map);
  }
}

export const createFhirServer = async (
  userId: number,
  fhirServerName: string,
  fhirServerEndpoint: string,
  fhirServerDescription?: string
) => {
  const fhirServer = await prisma.fhirServers
    .create({
      data: {
        fhirServerName,
        fhirServerEndpoint,
        fhirServerDescription,
        createdUserId: userId,
        updatedUserId: userId,
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  if (fhirServer instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = {
      error: fhirServer,
    };
    responseObject.message = fhirServer.message;
    return responseObject;
  }

  const responseObject = new ResponseClass();
  responseObject.status = 200;
  responseObject.data = {
    fhirServer: new FhirServerClass(fhirServer),
  };
  responseObject.message = `fhir server successfully added`;
  return responseObject;
};

export const readFhirServer = async (id: number) => {
  const fhirServer = await prisma.fhirServers
    .findUnique({
      where: {
        id,
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  if (fhirServer instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.message = fhirServer.message;
    responseObject.data = {
      error: fhirServer,
    };
    return responseObject;
  }

  if (!fhirServer) {
    const responseObject = new ResponseClass();
    responseObject.status = 404;
    responseObject.data = null;
    responseObject.message = `no fhir server found for ${id}`;
    return responseObject;
  }

  const responseObject = new ResponseClass();
  responseObject.status = 200;
  responseObject.message = `fhir server found for ID ${id}`;
  responseObject.data = {
    fhirServer: new FhirServerClass(fhirServer),
  };
  return responseObject;
};

export const updateFhirServer = async (
  id: number,
  userId: number,
  fhirServerName?: string,
  fhirServerDescription?: string,
  fhirServerEndpoint?: string
) => {
  const checkFhirServer = await readFhirServer(id);

  if (checkFhirServer.status !== 200) {
    return checkFhirServer;
  }

  const fhirServer = await prisma.fhirServers
    .update({
      where: {
        id,
      },
      data: {
        fhirServerName,
        fhirServerDescription,
        fhirServerEndpoint,
        updatedUserId: userId,
        updatedAt: new Date().toISOString(),
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  if (fhirServer instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = {
      error: fhirServer,
    };
    responseObject.message = fhirServer.message;
    return responseObject;
  }

  const responseObject = new ResponseClass();
  responseObject.status = 200;
  responseObject.data = {
    fhirServer: new FhirServerClass(fhirServer),
  };
  responseObject.message = `fhir server details updated`;
  return responseObject;
};

export const deleteFhirServer = async (id: number, userId: number) => {
  const checkFhirServer = await readFhirServer(id);
  if (checkFhirServer.status !== 200) {
    return checkFhirServer;
  }

  const fhirServer = await prisma.fhirServers
    .update({
      where: {
        id,
      },
      data: {
        retired: true,
        updatedAt: new Date().toISOString(),
        updatedUserId: userId,
      },
    })
    .catch((e) => {
      return new Error(e);
    });

  if (fhirServer instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = {
      error: fhirServer,
    };
    responseObject.message = fhirServer.message;
    return responseObject;
  }

  const responseObject = new ResponseClass();
  responseObject.status = 200;
  responseObject.data = {
    fhirServer: new FhirServerClass(fhirServer),
  };
  responseObject.message = `fhir server removed successfully`;
  return responseObject;
};

export const getAllFhirServers = async () => {
  const fhirServers = await prisma.fhirServers
    .findMany({
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

  if (fhirServers instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = {
      error: fhirServers,
    };
    responseObject.message = fhirServers.message;
    return responseObject;
  }

  const tempFhirServerClasses: Array<FhirServerClass> = [];
  fhirServers.forEach((server) => {
    let tempObject = new FhirServerClass(server);
    tempFhirServerClasses.push(tempObject);
  });

  const responseObject = new ResponseClass();
  responseObject.status = 200;
  responseObject.data = {
    fhirServers: tempFhirServerClasses,
  };
  responseObject.message = `${tempFhirServerClasses.length} fhir servers retrieved successfully`;
  return responseObject;
};
