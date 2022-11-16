import { Router } from "express";
import {
  createClient,
  getClientById,
  readClient,
} from "../controllers/clients";

const route = Router();

route.post("/client", async (req, res, next) => {
  const clientName: string = req.body.clientName;
  const clientHost: string = req.body.clientHost;
  const clientPublicKeyEndpoint: string = req.body.clientPublicKeyEndpoint;
  const privilages = req.body.privilages;
  const userId = 1;

  const request = await createClient(
    clientName,
    clientHost,
    clientPublicKeyEndpoint,
    userId,
    privilages
  );
  return res.status(request.status).json(request);
});

route.get("/client/:id", async (req, res, next) => {
  const id: string = req.params.id;
  const request = await readClient(id);

  return res.status(request.status).json(request);
});

export { route as clientRoutes };
