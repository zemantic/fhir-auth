import { Router } from "express";
import passport from "passport";
import { passportAuth } from "../auth/passport";
import {
  createFhirServer,
  deleteFhirServer,
  getAllFhirServers,
  readFhirServer,
  searchFhirServers,
  updateFhirServer,
} from "../controllers/fhirServer";

const route = Router();
passportAuth(passport);

route.get(
  "/fhir-server/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const serverId: string = req.params.id;
    const request = await readFhirServer(serverId);
    return res.status(request.status).json(request);
  }
);

route.post(
  "/fhir-server",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const userId = req.user;
    const fhirServerName: string = req.body.fhirServerName;
    const fhirServerDescription: string = req.body.fhirServerDescription;
    const fhirServerEndpoint: string = req.body.fhirServerEndpoint;

    const request = await createFhirServer(
      userId,
      fhirServerName,
      fhirServerEndpoint,
      fhirServerDescription
    );

    return res.status(request.status).json(request);
  }
);

route.delete(
  "/fhir-server/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const serverId: string = req.params.id;
    const userId: number = req.user;
    const request = await deleteFhirServer(serverId, userId);
    return res.status(request.status).json(request);
  }
);

route.patch(
  "/fhir-server/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const serverId: string = req.params.id;
    const fhirServerName: string = req.body.fhirServerName;
    const fhirServerEndpoint: string = req.body.fhirServerEndpoint;
    const fhirServerDescription: string = req.body.fhirServerDescription;
    const userId: number = req.user;

    const request = await updateFhirServer(
      serverId,
      userId,
      fhirServerName,
      fhirServerDescription,
      fhirServerEndpoint
    );
    return res.status(request.status).json(request);
  }
);

route.get(
  "/get-all-fhir-servers",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const take: number = 10;
    const skip: number = Number(req.query.skip);
    const request = await getAllFhirServers(skip, take);
    return res.status(request.status).json(request);
  }
);

route.post(
  "/search-server",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const query: string = req.body.query;
    const request = await searchFhirServers(query);
    return res.status(request.status).json(request);
  }
);
export { route as fhirServerRoutes };
