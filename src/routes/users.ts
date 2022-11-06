import { Router } from "express";
import { createUser } from "../controllers/users";

const route = Router();

route.post("/users", async (req, res, next) => {
  const name: string = req.body.name;
  const email: string = req.body.email;
  const password: string = req.body.password;

  const request = await createUser(name, email, password);
  return res.status(request.status).json(request);
});

export { route as userRoutes };
