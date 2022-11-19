import { Router } from "express";
import { readResources } from "../controllers/resources";

const routes = Router();

routes.get("/resources/:fhirVersion", async (req, res) => {
  const fhirVersion = Number(req.params.fhirVersion);
  const request = await readResources(fhirVersion);
  return res.status(request.status).json(request);
});

export { routes as resourceRoutes };
