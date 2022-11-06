import * as jose from "jose";
import prisma from "../helpers/prisma";

export const authenticate = async (
  publicKey: any,
  jwt: string,
  jku: string
) => {
  const generateKey = await jose.importJWK(publicKey);
  try {
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, generateKey);

    // check if token is expired
    if (Number(payload.exp) <= Date.now() / 1000) {
      return {
        status: 403,
        message: "jwt expired",
        data: null,
      };
    }

    // check if token is more then 5 minutes into the future
    if (Number(payload.exp) >= Date.now() / 1000 + 300) {
      return {
        status: 403,
        message: "jwt.exp should be less then 5 minutes (300s)",
        data: null,
      };
    }

    // check if jku matches the jku registered in the auth server
    // jku = url to the public key
    if (protectedHeader.jku) {
      if (protectedHeader.jku.toLowerCase() !== jku.toLowerCase()) {
        return {
          status: 403,
          message: "jku missmatch",
          data: null,
        };
      }
    }

    // check if the key has a kid
    // kid = unique id of the public private key pair
    if (!protectedHeader.kid) {
      return {
        status: 403,
        message: "kid is missing",
        data: null,
      };
    }

    // check if the kid in the sent jwt matches the kid of the public key
    if (protectedHeader.kid.toLowerCase() !== publicKey.kid.toLowerCase()) {
      return {
        status: 403,
        message: "kid missmatch",
        data: null,
      };
    }

    // check if the typ of the header matches JWT
    if (protectedHeader.typ && protectedHeader.typ.toUpperCase() !== "JWT") {
      return {
        status: 403,
        message: "invalid typ",
        data: null,
      };
    }

    // check if the algorithem matches RS382 or ES384 in the sent jwt
    // check if the kty value in the public key is "ES" or "RS"
    if (
      (protectedHeader.alg.toUpperCase() === "RS384" ||
        protectedHeader.alg.toUpperCase() === "ES384") &&
      (String(publicKey.kty).toUpperCase() === "RSA" ||
        String(publicKey.kty).toUpperCase() === "ES")
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
        return {
          status: 403,
          message: "invalid client id",
          data: null,
        };
      }

      if (client.client_id !== payload.sub) {
        return {
          status: 403,
          message: "jwt.sub jwt.iss and clientId missmatch",
          data: null,
        };
      }

      const accessTokenUrl = process.env.AUTH_URL;
      if (payload.aud !== accessTokenUrl) {
        console.log(payload.aud);
        console.log(accessTokenUrl);
        return {
          status: 403,
          message: "jwt.aud and token url missmatch",
          data: null,
        };
      }

      if (!payload.jti) {
        return {
          status: 403,
          message: "jwt.jti value is invalid",
          data: null,
        };
      }

      // generate jwt to be sent to the client
      // TODO: Set expriation time from the value set at settings, current expiration time set to 5 minutes (maximum value) recommended from the smart guidelines
      const jwtKey = new TextEncoder().encode(process.env.JWT_KEY);
      const jwt: string = await new jose.SignJWT({})
        .setProtectedHeader({
          alg: "HS256",
        })
        .setAudience(client.client_host)
        .setIssuedAt(Date.now() / 1000)
        .setExpirationTime(`300s`)
        .sign(jwtKey);
      return {
        status: 200,
        message: "authentication successfull",
        data: {
          access_token: jwt,
          token_type: "bearer",
          expires_in: 300, // 5 minutes TODO: to be set in the value retured from settings
          scope: "",
        },
      };
    } else {
      return {
        status: 403,
        message: "invalid algoritm only RS384 or ES384 supported",
        data: null,
      };
    }
  } catch (error) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return {
        status: 403,
        data: null,
        message: "jwt expired",
      };
    } else {
      return {
        status: 500,
        data: null,
        message: error,
      };
    }
  }
};

export const generateJwt = () => {};
