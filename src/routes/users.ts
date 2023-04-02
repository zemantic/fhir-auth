import { Router } from "express";
import { authenticateUser } from "../auth/user";
import { createUser } from "../controllers/users";
import { ResponseClass } from "../helpers/responseClass";
import {
  validateUserSignin,
  validateUserSignup,
} from "../validators/validator";

const route = Router();

route.post(
  "/signup",
  (req, res, next) => {
    if (validateUserSignup(req.body)) {
      return next();
    } else {
      const responseObject = new ResponseClass();
      responseObject.status = 400;
      // TODO: replace data with error object in next update
      responseObject.data = {
        error: validateUserSignup.errors,
      };
      responseObject.message = "error validating request";
      return res.status(responseObject.status).json(responseObject.toJSON());
    }
  },
  async (req, res, next) => {
    const name: string = req.body.name;
    const email: string = req.body.email;
    const password: string = req.body.password;

    const request = await createUser(name, email, password);
    return res.status(request.status).json(request);
  }
);

route.post(
  "/login",
  (req, res, next) => {
    if (validateUserSignin(req.body)) {
      return next();
    } else {
      const responseObject = new ResponseClass();
      responseObject.status = 400;
      responseObject.data = {
        error: validateUserSignin.errors,
      };
      responseObject.message = "error validating request";
      return res.status(responseObject.status).json(responseObject);
    }
  },
  async (req, res, next) => {
    const email: string = req.body.email;
    const password: string = req.body.password;
    const request = await authenticateUser(email, password);
    return res.status(request.status).json(request);
  }
);

export { route as userRoutes };
