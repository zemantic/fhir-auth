// This file complies all validators and
// exports the compiled validators to be used when neccessary
// As recommended in the AJV documentation
// https://ajv.js.org/guide/managing-schemas.html#compiling-during-initialization
// Please create an issue on GitHub if you think this approach is not necessary

import Ajv from "ajv";
import { userSigninValidator, userSignupValidator } from "./users";
const ajv = new Ajv();

const compileUserSignupSchema = ajv.compile(userSignupValidator);
const compileUserSigninSchema = ajv.compile(userSigninValidator);

export {
  compileUserSigninSchema as validateUserSignin,
  compileUserSignupSchema as validateUserSignup,
};
