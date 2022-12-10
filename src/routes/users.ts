import { Router } from "express";
import { authenticateUser } from "../auth/user";
import { createUser } from "../controllers/users";

const route = Router();

route.post("/signup", async (req, res, next) => {
  const name: string = req.body.name;
  const email: string = req.body.email;
  const password: string = req.body.password;

  const request = await createUser(name, email, password);
  return res.status(request.status).json(request);
});

route.post("/login", async (req, res, next) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  const request = await authenticateUser(email, password);
  return res.status(request.status).json(request);
});

export { route as userRoutes };
