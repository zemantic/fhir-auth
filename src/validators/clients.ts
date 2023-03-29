import { JSONSchemaType } from "ajv";

interface CreateClientData {
  clientName: string;
  clientHost: string;
  fhirEndpoint: number;
  clientPublicKeyEndpoint: string;
  clientDescription: string;
  isActive: boolean;
  globalSearch: boolean;
  batchRequests: boolean;
  privilages: Array<{}>;
}

const createClient: JSONSchemaType<CreateClientData> = {
  type: "object",
  properties: {
    clientName: { type: "string" },
    clientHost: { type: "string" },
    fhirEndpoint: { type: "number" },
    clientPublicKeyEndpoint: { type: "string" },
    clientDescription: { type: "string" },
    isActive: { type: "boolean" },
    globalSearch: { type: "boolean" },
    batchRequests: { type: "boolean" },
    privilages: {
      type: "array",
      minItems: 1,
      nullable: false,
      items: {
        type: "object",
      },
    },
  },
  required: [
    "clientName",
    "clientHost",
    "fhirEndpoint",
    "clientPublicKeyEndpoint",
    "clientDescription",
    "isActive",
    "globalSearch",
    "batchRequests",
    "privilages",
  ],
};

export { createClient as createClientValidator };
