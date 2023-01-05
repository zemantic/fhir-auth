import prisma from "../helpers/prisma";
import bcrypt from "bcrypt";
import { ResponseClass } from "../helpers/responseClass";

/**
 * user class
 */
class UserClass {
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
    map.delete("password");
    return Object.fromEntries(map);
  }
}

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const hashPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );

    const newUser = await prisma.users
      .create({
        data: {
          name,
          email,
          password: hashPassword,
        },
      })
      .catch((e) => {
        return new Error(e);
      })
      .finally(async () => {
        await prisma.$disconnect();
      });

    const responseObject = new ResponseClass();

    if (newUser instanceof Error) {
      responseObject.status = 500;
      responseObject.message = `error creating user ${newUser.message}`;
      responseObject.data = null;
      return responseObject;
    }

    if (newUser) {
      responseObject.status = 200;
      responseObject.data = {
        user: new UserClass(newUser),
      };
      responseObject.message = "new user created";
      return responseObject;
    } else {
      responseObject.status = 400;
      responseObject.data = null;
      responseObject.message = "an error occured when creating user";
      return responseObject;
    }
  } catch (error) {
    const responseObject = new ResponseClass();
    responseObject.status = 500;
    responseObject.data = error;
    responseObject.message = `an unexpected error occured`;
    return responseObject;
  }
};

export const getUserById = async (id: number) => {
  const getUser = await prisma.users
    .findUnique({
      where: {
        id,
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  const responseObject = new ResponseClass();

  if (getUser instanceof Error) {
    responseObject.status = 500;
    responseObject.data = {
      error: getUser,
    };
    responseObject.message = `error getting user with id ${id}`;
  } else if (!getUser) {
    responseObject.status = 404;
    responseObject.data = null;
    responseObject.message = `user not found for id ${id}`;
  } else {
    responseObject.status = 200;
    responseObject.data = {
      user: new UserClass(getUser),
    };
    responseObject.message = `user found for id ${id}`;
  }

  return responseObject;
};

export const getUserByEmail = async (email: string) => {
  const getUser = await prisma.users
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

  if (getUser instanceof Error) {
    responseObject.status = 500;
    responseObject.data = {
      error: getUser,
    };
    responseObject.message = `error getting user with id ${email}`;
  } else if (!getUser) {
    responseObject.status = 404;
    responseObject.data = null;
    responseObject.message = `user not found for email ${email}`;
  } else {
    responseObject.status = 200;
    responseObject.data = {
      user: new UserClass(getUser),
    };
    responseObject.message = `user found for email ${email}`;
  }

  return responseObject;
};

export const updateUser = async (
  id: number,
  userId: number,
  name?: string,
  email?: string,
  password?: string
) => {
  const checkUser = await getUserById(id);
  if (checkUser.status !== 200) {
    return checkUser;
  }

  const updateUser = await prisma.users
    .update({
      where: {
        id,
      },
      data: {
        name,
        email,
        password,
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  const responseObject = new ResponseClass();
  if (updateUser instanceof Error) {
    responseObject.status = 500;
    responseObject.data = {
      error: updateUser,
    };
    responseObject.message = `an error occured when updating user ${updateUser.message}`;
  } else {
    responseObject.status = 200;
    responseObject.data = {
      user: new UserClass(updateUser),
    };
    responseObject.message = `user updated successfully`;
  }

  responseObject;
};

export const deleteUser = async (id: number) => {
  const deleteUser = await prisma.users
    .update({
      where: {
        id,
      },
      data: {
        is_active: false,
      },
    })
    .catch((e) => {
      return new Error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  const responseObject = new ResponseClass();

  if (deleteUser instanceof Error) {
    responseObject.status = 500;
    responseObject.message = `error deleting user ${deleteUser.message}`;
    responseObject.data = null;
    return responseObject;
  }

  responseObject.status = 500;
  responseObject.data = { user: new UserClass(deleteUser) };
  responseObject.message = `user successfully deleted ${id}`;
  return responseObject;
};
