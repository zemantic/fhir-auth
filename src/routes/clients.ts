import { Router } from "express";
import { createClient, getClientById } from "../controllers/clients";

const route = Router();

route.post("/client", async (req, res, next) => {
  const clientName: string = req.body.clientName;
  const clientHost: string = req.body.clientHost;
  const clientPublicKeyEndpoint: string = req.body.clientPublicKeyEndpoint;
  const userId = 1;

  const request = await createClient(
    clientName,
    clientHost,
    clientPublicKeyEndpoint,
    userId
  );
  return res.status(request.status).json(request);
});

route.get("/client/:id", async (req, res, next) => {
  const id: string = req.params.id;
  const request = await getClientById(Number(id));

  return res.status(request.status).json(request.data?.client?.client_id);
});

export { route as clientRoutes };
