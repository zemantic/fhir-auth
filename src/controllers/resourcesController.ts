import prisma from "../helpers/prisma";
import { ResponseClass } from "../helpers/responseClass";

export const readResources = async (fhirVersion: number) => {
  const resources = await prisma.resources
    .findMany({
      where: {
        fhir_version: fhirVersion,
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
  }

  responseObject.status = 200;
  responseObject.data = {
    resources,
  };
  responseObject.message = `resources retrieved for FHIR version ${fhirVersion}`;

  return responseObject;
};
