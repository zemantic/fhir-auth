import { Router } from "express";
import { verifyJwt, verifyScopes } from "../auth/authentication";

const route = Router();

route.all("/fhir/*", async (req, res, next) => {
  const token = req.headers.authorization;
  const verify = await verifyJwt(token);
  if (verify.status !== 200) {
    return res.status(verify.status).json(verify);
  }
  res.locals.scopes = verify.data.scopes;
  res.locals.clientId = verify.data.clientId;
  next();
});

route.get("/fhir/:resource/:id?", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiyScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiyScopes[checkResource].privilages.read) {
    // TODO: ADD FETCH REQUEST TO FHIR SERVER
    return res.status(200).send(req.query);
  }

  return res.status(401).send(req.query);
});

route.post("/fhir/:resource/_search", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiyScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );
  if (checkResource !== -1 && verfiyScopes[checkResource].privilages.search) {
    // TODO: ADD FETCH REQUEST TO FHIR SERVER
    return res.status(200).send(req.query);
  }
  return res.status(401).send(req.query);
});

route.post("/fhir/:resource", async (req, res, nex) => {
  const verfiyScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiyScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiyScopes[checkResource].privilages.create) {
    // TODO: ADD FETCH REQUEST TO FHIR SERVER
    return res.status(200).send(req.query);
  }

  return res.status(401).send(req.query);
});

route.put("/fhir/:resource", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiyScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiyScopes[checkResource].privilages.update) {
    // TODO: ADD FETCH REQUEST TO FHIR SERVER
    return res.status(200).send(req.query);
  }

  return res.status(401).send(req.query);
});

route.patch("/fhir/:resource", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiyScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiyScopes[checkResource].privilages.update) {
    // TODO: ADD FETCH REQUEST TO FHIR SERVER
    return res.status(200).send(req.query);
  }

  return res.status(401).send(req.query);
});

route.delete("/fhir/:resource/id?", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiyScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiyScopes[checkResource].privilages.delete) {
    // TODO: ADD FETCH REQUEST TO FHIR SERVER
    return res.status(200).send(req.query);
  }

  return res.status(401).send(req.query);
});

export { route as fhirRoutes };
