import prisma from "../helpers/prisma";

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  // TODO: add bycrypt to hash password
  const newUser = await prisma.users
    .create({
      data: {
        name,
        email,
        password,
      },
    })
    .catch((e) => {
      throw e;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  if (newUser) {
    return {
      status: 200,
      data: {
        user: {
          id: Number(newUser.id),
          name: newUser.name,
          email: newUser.email,
        },
      },
      message: `new user created, user id - ${newUser.id}`,
    };
  } else {
    return {
      status: 400,
      data: null,
      message: "an error occred when creating a new user, user not created",
    };
  }
};
