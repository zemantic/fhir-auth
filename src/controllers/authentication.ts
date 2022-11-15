import { authenticate } from "../auth/authentication";
import prisma from "../helpers/prisma";
import fetch from "node-fetch";

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
      status: 400,
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
      status: 400,
      data: {
        error: "invalid_client",
      },
      message: `client_assertion_type sent is '${client_assertion_type}' when required client_assertion_type is 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'`,
    };
  }

  const privileges = await parseScopes(scope);
  // const checkPrivilages = await validatedPrivilages(privileges);
  //
  // check if scope meet SMART requirements
  if (privileges?.status === 200) {
    // fetch public key from the request server
    const client = await prisma.clients
      .findUnique({
        where: {
          client_id: clientId,
        },
      })
      .finally(async () => {
        await prisma.$disconnect;
      })
      .catch(() => {});

    if (!client) {
      return {
        status: 400,
        data: {
          error: "invalid_client",
        },
        message: `no client exists with the ${clientId}`,
      };
    }

    const clientHost = client.client_host;
    const clientUrl = new URL(clientHost);

    // check if the request originates from the registered client host and if it's the same host that stores the public key
    if (
      clientUrl.hostname !== host ||
      host !== new URL(client.client_public_key_endpoint).hostname
    ) {
      console.log(clientUrl.host);
      console.log(host);
      return {
        status: 400,
        data: {
          error: "invalid_client",
          message: `invalid requesting client host ${host}`,
        },
      };
    }

    const getClientPublicKey = await fetch(client.client_public_key_endpoint);
    if (getClientPublicKey.status !== 200) {
      return {
        status: 400,
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
      client.client_public_key_endpoint
    );

    if (authVerify.status !== 200) {
      return {
        status: 400,
        data: {
          error: "invalid_client",
        },
        message: authVerify.message,
      };
    }

    return {
      status: 200,
      data: {
        data: authVerify,
      },
      message: "matched",
    };
  } else {
    return {
      status: 400,
      data: {
        error: "invalid_client",
      },
      message: "the supported scopes are patient | user | system",
    };
  }
};

const parseScopes = async (scopes: string) => {
  if (scopes.trim().length === 0) {
    return {
      status: 401,
      data: null,
      message: "empty scopes",
    };
  }

  const splitScopes: string[] = scopes.split(" ");

  // Alternative syntax using RegExp constructor
  //   const regex = /patient|system|user|\/([A-z]*?)\.(.*)\?(.*)/gm;

  const regex = new RegExp(
    "(patient|system|user)\\/([A-z]*?)\\.(.*)\\?(.*)",
    "gm"
  );

  const outputScopes: Array<{ resource: string; operation: string }> = [];
  for (let index = 0; index < splitScopes.length; index++) {
    const scope = splitScopes[index];
    const subScopes = scope.split(regex).filter((c) => c !== "");
    // TODO: Dynamically get scopes from the database
    if (
      subScopes[0] === "system" ||
      subScopes[0] === "user" ||
      subScopes[0] === "patient"
    ) {
      return {
        status: 200,
      };
    } else {
      return {
        status: 403,
        message: "invalid scope",
        data: null,
      };
    }
  }
};

const validatedPrivilages = async (
  privileges: Array<{ resouce: string; privilage: string }>
) => {};
