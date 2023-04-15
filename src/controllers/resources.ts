import prisma from "../helpers/prisma";
import { ResponseClass } from "../helpers/responseClass";

class ResourceClass {
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
    this.map = map;
  }

  toJSON() {
    const map = this.map;
    return Object.fromEntries(map);
  }
}

export const readResources = async (fhirVersion: number) => {
  const resources = await prisma.resources
    .findMany({
      where: {
        fhirVersion,
        isActive: true,
      },
      orderBy: { resourceName: "asc" },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  const responseObject = new ResponseClass();
  if (resources instanceof Error) {
    responseObject.data = {
      error: resources.message,
    };
    responseObject.message = "an error occured in getting resources";
    responseObject.status = 500;
    return responseObject;
  }

  const tempResources: Array<ResourceClass> = [];
  resources.forEach((resource) => {
    let tempObject = new ResourceClass(resource);
    tempResources.push(tempObject);
  });

  responseObject.status = 200;
  responseObject.data = {
    resources: tempResources,
  };
  responseObject.message = `resources retrieved for FHIR version ${fhirVersion}`;

  return responseObject;
};

export const patchResources = async (
  resources: Array<{
    resourceName: string;
    fhirVersion: number;
    maturityStatus: number;
    isActive: boolean;
    id?: number;
  }>
) => {
  try {
    for (const resource of resources) {
      const newResource = await prisma.resources
        .upsert({
          where: {
            id: resource.id || 0,
          },
          create: {
            resourceName: resource.resourceName,
            fhirVersion: resource.fhirVersion,
            isActive: true,
            maturityStatus: resource.maturityStatus,
          },
          update: {
            resourceName: resource.resourceName,
            fhirVersion: resource.fhirVersion,
            isActive: resource.isActive,
            maturityStatus: resource.maturityStatus,
          },
        })
        .catch((e) => {
          return new Error(e);
        })
        .finally(async () => {
          await prisma.$disconnect();
        });

      if (newResource instanceof Error) {
        console.log(newResource);
        const responseObject = new ResponseClass();
        responseObject.status = 500;
        responseObject.data = {
          error: newResource,
        };
        responseObject.message =
          "an error occured when creating fhir resources";
        return responseObject;
      }
    }

    const responseObject = new ResponseClass();
    responseObject.status = 200;
    responseObject.message = "resources updated";
    responseObject.data = {
      resources,
    };
    return responseObject;
  } catch (error) {
    console.log(error);
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = {
      error: error,
    };
    responseObject.message = "an error occured when updating resources";
    return responseObject;
  }
};
