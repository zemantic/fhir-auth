export const authenticationFlow = async (
  scope: string,
  grant_type: string,
  client_assertion_type: string,
  client_assertion: string,
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

  // Alternative syntax using RegExp constructor
  //   const regex = /patient|system|user|\/([A-z]*?)\.(.*)\?(.*)/gm;

  const regex = new RegExp(
    "(patient|system|user)\\/([A-z]*?)\\.(.*)\\?(.*)",
    "gm"
  );

  // divide scopes into iterables
  const scopes = scope.split(regex).filter((c) => c !== "");

  // check if scope meet SMART requirements
  // TODO: Dynamically get scopes from the database
  if (
    scopes[0] === "patient" ||
    scopes[0] === "user" ||
    scopes[0] === "system"
  ) {
    // fetch public key from the request server
  } else {
    return {
      status: 400,
      data: {
        error: "invalid_client",
      },
      message: "the supported scopes are patient | user | system",
    };
  }

  return {
    status: 200,
    data: {
      data: host,
    },
    message: "matched",
  };
};
