import * as jose from "jose";
import prisma from "../helpers/prisma";

export const authenticate = async (publicKey: any, jwt: string) => {
  const generateKey = await jose.importJWK(publicKey);
  const { payload, protectedHeader } = await jose.jwtVerify(jwt, generateKey);

  if (!protectedHeader.kid) {
    return {
      status: 403,
      message: "kid is missing",
      data: null,
    };
  }

  if (protectedHeader.typ !== "JWT") {
    return {
      status: 403,
      message: "invalid typ",
      data: null,
    };
  }

  if (protectedHeader.alg === "RS384" || protectedHeader.alg === "ES384") {
  } else {
    return {
      status: 403,
      message: "invalid algoritm only RS384 or ES384 supported",
      data: null,
    };
  }

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

  if (payload.aud !== process.env.OAUTH_URL) {
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

  if (Number(payload.exp) <= Date.now() + 60000) {
    return {
      status: 403,
      message: "jwt.exp should be less then 5 minutes (60000)",
      data: null,
    };
  }

  return {
    status: 200,
    message: "authentication successfull",
    data: {
      payload,
      protectedHeader,
    },
  };
};
