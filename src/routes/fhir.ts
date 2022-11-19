import { Router } from "express";
import { verifyJwt, verifyScopes } from "../auth/authentication";

const route = Router();

route.get("/fhir/:resource/:id", (req, res, next) => {
  const tempPrivilages = [
    {
      resource: "Patient",
      resourceId: 1,
      privilages: {
        create: true,
        read: true,
        search: true,
        update: true,
        delete: true,
      },
    },
  ];

  const checkResource = tempPrivilages.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && tempPrivilages[checkResource].privilages.read) {
    return res.status(200).send(req.query);
  }

  return res.status(403).send(req.query);
});

route.get("/fhir/:resource", (req, res, next) => {
  return res.json({});
});

route.post("/fhir/:resource/_search", (req, res, next) => {});

route.post("/fhir/:resource", (req, res, nex) => {});

route.put("/fhir/:resource", (req, res, next) => {});

route.patch("/fhir/:resource", (req, res, next) => {});

// route.get(
//   "/fhir/:params",
//   async (req, res, next) => {
//     const token = req.headers.authorization;
//     const verify = await verifyJwt(token);
//     if (verify.status !== 200) {
//       return res.status(verify.status).json(verify);
//     } else {
//       res.locals.clientId = verify.data.clientsId;
//       res.locals.scopes = verify.data.scopes;
//     }
//     next();
//   },
//   (req, res, next) => {
//     const verfiedScopes = verifyScopes(
//       res.locals.scopes,
//       Number(res.locals.clientId)
//     );
//   }
// );

export { route as fhirRoutes };
