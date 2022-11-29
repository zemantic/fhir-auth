import { Router } from "express";
import {
  createClient,
  getAllClients,
  readClient,
  updateClient,
} from "../controllers/clients";

const route = Router();

route.post("/client", async (req, res, next) => {
  const clientName: string = req.body.clientName;
  const clientHost: string = req.body.clientHost;
  const fhirEndpoint: string = req.body.fhirEndpoint;
  const clientPublicKeyEndpoint: string = req.body.clientPublicKeyEndpoint;
  const privilages = req.body.privilages;
  const isActive = req.body.isActive;
  //TODO: Add passport support and get userID
  const userId = 1;

  const request = await createClient(
    clientName,
    clientHost,
    clientPublicKeyEndpoint,
    userId,
    privilages,
    fhirEndpoint,
    isActive
  );
  return res.status(request.status).json(request);
});

route.get("/client/:id", async (req, res, next) => {
  const id: string = req.params.id;
  const request = await readClient(id);

  return res.status(request.status).json(request);
});

route.patch("/client", async (req, res, next) => {
  const clientsId: number = Number(req.body.clientsId);
  const clientName: string = req.body.clientName;
  const clientHost: string = req.body.clientHost;
  const fhirEndpoint: string = req.body.fhirEndpoint;
  const clientPublicKeyEndpoint: string = req.body.clientPublicKeyEndpoint;
  const privilages = req.body.privilages;
  const isActive = req.body.isActive;
  // TODO: Add passport support and get user id
  const userId = 1;

  const request = await updateClient(
    clientsId,
    clientName,
    clientHost,
    clientPublicKeyEndpoint,
    userId,
    privilages,
    fhirEndpoint,
    isActive
  );

  return res.status(request.status).json(request);
});

route.get("/client/all", async (req, res, next) => {
  const skip = Number(req.query.skip);
  const take = 20;
  const request = await getAllClients(skip, take);
  return res.status(request.status).json(request);
});

export { route as clientRoutes };
