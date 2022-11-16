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
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  const responseObject = new ResponseClass();
  if (resources instanceof Error) {
    responseObject.data = resources;
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
