import { getUserByEmail } from "../controllers/users";
import bcrypt from "bcrypt";
import { ResponseClass } from "../helpers/responseClass";
import * as jose from "jose";
import prisma from "../helpers/prisma";

export const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.users
    .findUnique({
      where: {
        email,
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  const responseObject = new ResponseClass();

  if (!user) {
    responseObject.status = 404;
    responseObject.message = `no user found`;
    responseObject.data = null;
    return responseObject;
  }

  if (user instanceof Error) {
    responseObject.status = 500;
    responseObject.data = {
      error: user,
    };
    responseObject.message = `an error occured in logging in`;
    return responseObject;
  }

  const validate = await bcrypt.compare(password, user.password);

  if (validate) {
    const jwtSecretObject = new TextEncoder().encode(process.env.JWT_KEY);
    const jwt = await new jose.SignJWT({ userId: Number(user.id) })
      .setExpirationTime("2h")
      .setIssuedAt(Date.now())
      .setProtectedHeader({ alg: "HS256" })
      .sign(jwtSecretObject);

    responseObject.data = {
      user: {
        email: email,
        id: Number(user.id),
      },
      token: jwt,
      expiration: "2h",
    };

    responseObject.status = 200;
    responseObject.message = `user authenticated`;
  } else {
    responseObject.status = 403;
    responseObject.data = null;
    responseObject.message = "authentication failed";
  }

  return responseObject;
};
