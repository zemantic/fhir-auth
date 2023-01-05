import { JSONSchemaType } from "ajv";

interface UserSignupData {
  name: string;
  email: string;
  password: string;
}

const userSignup: JSONSchemaType<UserSignupData> = {
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string" },
    password: { type: "string" },
  },
  required: ["email", "password", "name"],
  additionalProperties: false,
};

interface UseriSigninData {
  email: string;
  password: string;
}

const userSignin: JSONSchemaType<UseriSigninData> = {
  type: "object",
  properties: {
    email: { type: "string" },
    password: { type: "string" },
  },
  required: ["email", "password"],
  additionalProperties: false,
};

export { userSignup as userSignupValidator, userSignin as userSigninValidator };
