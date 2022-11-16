import * as jose from "jose";
import prisma from "../helpers/prisma";
import { ResponseClass } from "../helpers/responseClass";

export const authenticate = async (
  publicKey: any,
  jwt: string,
  jku: string,
  scopes: Array<{ resource: string; operations: string[] }>
) => {
  try {
    const generateKey = await jose.importJWK(publicKey);
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, generateKey);

    // check if token is expired
    if (Number(payload.exp) <= Date.now() / 1000) {
      const responseObject = new ResponseClass();
      responseObject.status = 403;
      responseObject.message = "jwt expired";
      responseObject.data = null;
      return responseObject;
    }

    // check if token is more then 5 minutes into the future
    if (Number(payload.exp) >= Date.now() / 1000 + 300) {
      const responseObject = new ResponseClass();
      responseObject.status = 403;
      responseObject.message = "jwt.exp should be less then 5 minutes (300s)";
      responseObject.data = null;
      return responseObject;
    }

    // check if jku matches the jku registered in the auth server
    // jku = url to the public key
    if (protectedHeader.jku) {
      if (protectedHeader.jku.toLowerCase() !== jku.toLowerCase()) {
        const responseObject = new ResponseClass();
        responseObject.status = 403;
        responseObject.message = "jku missmatch";
        responseObject.data = null;
        return responseObject;
      }
    }

    // check if the key has a kid
    // kid = unique id of the public private key pair
    if (!protectedHeader.kid) {
      const responseObject = new ResponseClass();
      responseObject.status = 403;
      responseObject.data = null;
      responseObject.message = "missing kid";
      return responseObject;
    }

    // check if the kid in the sent jwt matches the kid of the public key
    if (protectedHeader.kid.toLowerCase() !== publicKey.kid.toLowerCase()) {
      const responseObject = new ResponseClass();
      responseObject.status = 403;
      responseObject.data = null;
      responseObject.message = "kid missmatch";
      return responseObject;
    }

    // check if the typ of the header matches JWT
    if (protectedHeader.typ && protectedHeader.typ.toUpperCase() !== "JWT") {
      const responseObject = new ResponseClass();
      responseObject.status = 403;
      responseObject.data = null;
      responseObject.message = "invalid typ";
      return responseObject;
    }

    // check if the algorithem matches RS382 or ES384 in the sent jwt
    // check if the kty value in the public key is "ES" or "RS"
    if (
      (protectedHeader.alg.toUpperCase() === "RS384" ||
        protectedHeader.alg.toUpperCase() === "ES384") &&
      (String(publicKey.kty).toUpperCase() === "RSA" ||
        String(publicKey.kty).toUpperCase() === "EC")
    ) {
      const client = await prisma.clients
        .findUnique({
          where: {
            client_id: payload.iss,
          },
        })
        .catch((e) => {
          throw e;
        })
        .finally(async () => {
          await prisma.$disconnect();
        });

      if (!client) {
        const responseObject = new ResponseClass();
        responseObject.status = 403;
        responseObject.data = null;
        responseObject.message = "invalid client_id";
        return responseObject;
      }

      if (client.client_id !== payload.sub) {
        const responseObject = new ResponseClass();
        responseObject.status = 403;
        responseObject.data = null;
        responseObject.message = "jwt.sub jwt.iss and clientId missmatch";
        return responseObject;
      }

      const accessTokenUrl = process.env.AUTH_URL;
      if (payload.aud !== accessTokenUrl) {
        const responseObject = new ResponseClass();
        responseObject.status = 403;
        responseObject.data = null;
        responseObject.message = "jwt.aud and token url missmatch";
        return responseObject;
      }

      if (!payload.jti) {
        const responseObject = new ResponseClass();
        responseObject.status = 403;
        responseObject.message = "jwt.jti value is invalid";
        responseObject.data = null;
        return responseObject;
      }

      // authorize scopes
      const authorizedScopes = await authorize(Number(client.id), scopes);
      // return invalid response if no matching authorization scopes
      if (authorizedScopes.length === 0) {
        const responseObject = new ResponseClass();
        responseObject.status = 403;
        responseObject.data = {
          // TODO: Add error URI from database or fixed value
          error_uri: "",
          error_description:
            "the requested authorization scopes are not authorizable",
        };
        responseObject.message = `requested authorization scopes are not authorizable`;
        return responseObject;
      }

      // compress scopes to fit return token
      const compressAuthorizeScopes = compressScopes(authorizedScopes);

      // generate jwt to be sent to the client
      // TODO: Set expriation time from the value set at settings, current expiration time set to 5 minutes (maximum value) recommended from the smart guidelines
      const jwtKey = new TextEncoder().encode(process.env.JWT_KEY);
      const jwt: string = await new jose.SignJWT({
        scopes: compressAuthorizeScopes,
        client: client.client_id,
        clientId: Number(client.id),
      })
        .setProtectedHeader({
          alg: "HS256",
        })
        .setAudience(client.client_host)
        .setIssuedAt(Date.now() / 1000)
        .setExpirationTime(`300s`)
        .sign(jwtKey);

      const responseObject = new ResponseClass();
      responseObject.status = 200;
      responseObject.data = {
        access_token: jwt,
        token_type: "bearer",
        expires_in: 300,
        scopes: authorizedScopes,
      };
      responseObject.message = "authorization successfull";
      return responseObject;
    } else {
      const responseObject = new ResponseClass();
      responseObject.status = 401;
      responseObject.data = null;
      responseObject.message = "invalid algoritm only RS384 or ES384 supported";
      return responseObject;
    }
  } catch (error) {
    if (error.code === "ERR_JWT_EXPIRED") {
      const responseObject = new ResponseClass();
      responseObject.status = 401;
      responseObject.data = null;
      responseObject.message = "jwt has expired";
      return responseObject;
    } else {
      const responseObject = new ResponseClass();
      responseObject.status = 500;
      responseObject.data = {
        error: error,
      };
      responseObject.message = "an unexpected error occred when authenticating";
      return responseObject;
    }
  }
};

export const authorize = async (
  clientId: number,
  privilages: Array<{ resource: string; operations: string[] }>
) => {
  let authorization: Array<{
    resource: string;
    resourceId: number;
    privilages: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      search: boolean;
    };
  }> = [];

  const clientPrivilages = await prisma.clientPrivilages
    .findMany({
      where: {
        clientsId: clientId,
      },
      include: {
        resource: true,
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  if (clientPrivilages instanceof Error) {
    return [];
  }

  privilages.forEach((privilage) => {
    let tempResource = clientPrivilages.find(
      (cprivilage) => cprivilage.resource.resource_name === privilage.resource
    );
    if (tempResource) {
      let readPrivilage = tempResource.read;
      let createPrivilage = tempResource.create;
      let updatePrivilage = tempResource.update;
      let deletePrivilage = tempResource.delete;
      let searchPrivilage = tempResource.search;

      let tempAuthorizationPrivilages: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        search: boolean;
      } = {
        create: false,
        read: false,
        update: false,
        delete: false,
        search: false,
      };
      privilage.operations.forEach((operation) => {
        if (operation === "c" && createPrivilage === true) {
          tempAuthorizationPrivilages.create = true;
        }

        if (operation === "r" && readPrivilage === true) {
          tempAuthorizationPrivilages.read = true;
        }

        if (operation === "u" && updatePrivilage === true) {
          tempAuthorizationPrivilages.update = true;
        }

        if (operation === "d" && deletePrivilage === true) {
          tempAuthorizationPrivilages.delete = true;
        }

        if (operation === "s" && searchPrivilage === true) {
          tempAuthorizationPrivilages.search = true;
        }

        if (operation === "*") {
          if (createPrivilage === true)
            tempAuthorizationPrivilages.create = true;
          if (readPrivilage === true) tempAuthorizationPrivilages.read = true;
          if (updatePrivilage === true)
            tempAuthorizationPrivilages.update = true;
          if (deletePrivilage === true)
            tempAuthorizationPrivilages.delete = true;
          if (searchPrivilage === true)
            tempAuthorizationPrivilages.search = true;
        }
      });

      let tempAuthorization = {
        resource: tempResource.resource.resource_name,
        resourceId: Number(tempResource.resource.id),
        privilages: tempAuthorizationPrivilages,
      };

      authorization.push(tempAuthorization);
    }
  });

  return authorization;
};

const compressScopes = (
  scopes: Array<{
    resource: string;
    resourceId: number;
    privilages: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      search: boolean;
    };
  }>
) => {
  const compressedAuthScopes: {
    create: number[];
    read: number[];
    update: number[];
    delete: number[];
    search: number[];
  } = {
    create: [],
    read: [],
    update: [],
    delete: [],
    search: [],
  };

  scopes.forEach((scope) => {
    if (scope.privilages.create)
      compressedAuthScopes.create.push(scope.resourceId);
    if (scope.privilages.read) compressedAuthScopes.read.push(scope.resourceId);
    if (scope.privilages.update)
      compressedAuthScopes.update.push(scope.resourceId);
    if (scope.privilages.delete)
      compressedAuthScopes.delete.push(scope.resourceId);
    if (scope.privilages.search)
      compressedAuthScopes.search.push(scope.resourceId);
  });

  return compressedAuthScopes;
};
