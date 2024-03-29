import { Router } from "express";
import passport from "passport";
import { passportAuth } from "../auth/passport";
import {
  createClient,
  deleteClient,
  getAllClients,
  readClient,
  searchClient,
  updateClient,
} from "../controllers/clients";

passportAuth(passport);

const route = Router();

route.post(
  "/client",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const clientName: string = req.body.clientName;
    const clientHost: string = req.body.clientHost;
    const fhirEndpoint: number = req.body.fhirEndpoint;
    const clientPublicKeyEndpoint: string = req.body.clientPublicKeyEndpoint;
    const privilages = req.body.privilages;
    const isActive = req.body.isActive;
    const clientDescription = req.body.clientDescription;
    const globalSearch = req.body.enableGlobalSearch;
    const batchRequests = req.body.enableBatchRequests;
    const userId = Number(req.user);

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
  }
);

route.get(
  "/client/:clientId",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const clientId: string = req.params.clientId;
    const request = await readClient(clientId);

    return res.status(request.status).json(request);
  }
);

route.patch(
  "/client",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const clientsId: number = Number(req.body.clientsId);
    const clientName: string = req.body.clientName;
    const clientHost: string = req.body.clientHost;
    const fhirEndpoint: number = Number(req.body.fhirEndpoint);
    const clientPublicKeyEndpoint: string = req.body.clientPublicKeyEndpoint;
    const privilages = req.body.privilages;
    const isActive = req.body.isActive;
    const clientDescription = req.body.clientDescription;
    const batchRequests = req.body.enableBatchRequests;
    const globalSearch = req.body.enableGlobalSearch;
    const userId = Number(req.user);

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
  }
);

route.delete(
  "/client/:clientId",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const usersId = Number(req.user);
    const clientId: string = req.params.clientId;
    const request = await deleteClient(clientId, usersId);
    return res.status(request.status).json(request);
  }
);

route.get(
  "/get-all-clients",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const skip = Number(req.query.skip);
    const take = 10;
    const request = await getAllClients(skip, take);
    return res.status(request.status).json(request);
  }
);

route.post(
  "/search-client",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const query = req.body.query;
    const request = await searchClient(query);
    return res.status(request.status).json(request);
  }
);

export { route as clientRoutes };
