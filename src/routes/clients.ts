import { Router } from "express";
import { createClient, readClient, updateClient } from "../controllers/clients";

const route = Router();

route.post("/client", async (req, res, next) => {
  const clientName: string = req.body.clientName;
  const clientHost: string = req.body.clientHost;
  const fhirEndpoint: string = req.body.fhirEndpoint;
  const clientPublicKeyEndpoint: string = req.body.clientPublicKeyEndpoint;
  const privilages = req.body.privilages;
  const isActive = req.body.isActive;
  const clientDescription = req.body.clientDescription;
  const globalSearch = req.body.enableGlobalSearch;
  const batchRequests = req.body.enableBatchRequests;
  //TODO: Add passport support and get userID
  const userId = 1;

  console.log(batchRequests);
  console.log(globalSearch);

  const request = await createClient(
    clientName,
    clientHost,
    clientPublicKeyEndpoint,
    userId,
    clientDescription,
    batchRequests,
    globalSearch,
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
  const clientDescription = req.body.clientDescription;
  const batchRequests = req.body.enableBatchRequests;
  const globalSearch = req.body.enableGlobalSearch;
  // TODO: Add passport support and get user id
  const userId = 1;

  console.log(batchRequests);
  console.log(globalSearch);
  const request = await updateClient(
    clientsId,
    clientName,
    clientHost,
    clientPublicKeyEndpoint,
    userId,
    clientDescription,
    batchRequests,
    globalSearch,
    privilages,
    fhirEndpoint,
    isActive
  );

  return res.status(request.status).json(request);
});

export { route as clientRoutes };
