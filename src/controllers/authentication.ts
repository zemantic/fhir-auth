import { authenticate } from "../auth/authentication";
import prisma from "../helpers/prisma";
import fetch from "node-fetch";
import { ResponseClass } from "../helpers/responseClass";

export const authenticationFlow = async (
  scope: string,
  grant_type: string,
  client_assertion_type: string,
  client_assertion: string,
  clientId: string,
  host: string
) => {
  //   validates if client_credentials are valid
  if (grant_type !== "client_credentials") {
    return {
      status: 401,
      data: {
        error: "invalid_client",
      },
      message: `grant_type sent is '${grant_type}' when grant type required is 'client_credentials'`,
    };
  }

  //   validats if client_assertion_type is valid
  if (
    client_assertion_type !==
    "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"
  ) {
    return {
      status: 401,
      data: {
        error: "invalid_client",
      },
      message: `client_assertion_type sent is '${client_assertion_type}' when required client_assertion_type is 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'`,
    };
  }

  // fetch public key from the request server
  const client = await prisma.clients
    .findUnique({
      where: {
        clientId,
      },
    })
    .finally(async () => {
      await prisma.$disconnect;
    })
    .catch((e) => {
      return new Error(e);
    });

  if (client instanceof Error) {
    const responseObject = new ResponseClass();
    responseObject.status = 401;
    responseObject.message = "invalid_client";
    responseObject.data = null;
    return responseObject;
  }

  if (!client) {
    return {
      status: 401,
      data: {
        error: "invalid_client",
      },
      message: `no client exists with the ${clientId}`,
    };
  }

  const clientHost = client.clientHost;
  const clientUrl = new URL(clientHost);

  // check if the request originates from the registered client host and if it's the same host that stores the public key
  if (
    clientUrl.hostname !== host ||
    host !== new URL(client.clientPublicKeyEndpoint).hostname
  ) {
    return {
      status: 401,
      data: {
        error: "invalid_client",
        message: `invalid requesting client host ${host}`,
      },
    };
  }

  // check if the scopes are in SMART format
  const parsedScopes = await parseScopes(scope);

  if (parsedScopes.length === 0) {
    const responseObject = new ResponseClass();
    responseObject.status = 401;
    responseObject.data = {
      error: "invalid_scopes",
    };
    responseObject.message = `invalid scopes provided, the supported scopes are patient | user | system`;
    return responseObject;
  }

  const getClientPublicKey = await fetch(client.clientPublicKeyEndpoint, {
    method: "GET",
  });

  if (getClientPublicKey.status !== 200) {
    return {
      status: 401,
      data: {
        error: "invalid_client",
        message: `client public key cannot be obtained`,
      },
    };
  }

  const clientPublicKey = await getClientPublicKey.text();
  const authVerify = await authenticate(
    JSON.parse(clientPublicKey),
    client_assertion,
    client.clientPublicKeyEndpoint,
    parsedScopes
  );

  if (authVerify.status !== 200) {
    return {
      status: 401,
      data: {
        error: "invalid_client",
      },
      message: authVerify.message,
    };
  }

  return authVerify;
};

const parseScopes = async (scopes: string) => {
  if (scopes.trim().length === 0) {
    return [];
  }

  const splitScopes: string[] = scopes.split(" ");

  // Alternative syntax using RegExp constructor
  //   const regex = /patient|system|user|\/([A-z]*?)\.(.*)\?(.*)/gm;

  const regex = new RegExp(
    "(patient|system|user)\\/([A-z]*?)\\.(.*)\\.*?(.*)",
    "gm"
  );

  const outputScopes: Array<{ resource: string; operations: string[] }> = [];
  for (let index = 0; index < splitScopes.length; index++) {
    const scope = splitScopes[index];
    const subScopes = scope.split(regex).filter((c) => c !== "");
    // TODO: Dynamically get scopes from the database
    if (
      subScopes[0] === "system" ||
      subScopes[0] === "user" ||
      subScopes[0] === "patient"
    ) {
      if (subScopes[1] && subScopes[2]) {
        let tempPrivilage = {
          resource: subScopes[1],
          operations: subScopes[2].split(""),
        };
        outputScopes.push(tempPrivilage);
      }
    } else {
      return [];
    }
  }

  return outputScopes;
};
