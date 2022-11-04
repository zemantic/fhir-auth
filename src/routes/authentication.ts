import { Router } from "express";
import { authenticationFlow } from "../controllers/authentication";

const route = Router();

route.post("/oauth/access_token", async (req, res, next) => {
  const scope: string = req.body.scope;
  const grant_type: string = req.body.grant_type;
  const client_assertion_type: string = req.body.client_assertion_type;
  const client_assertion: string = req.body.client_assertion;
  const host: string = req.hostname;

  const request = await authenticationFlow(
    scope,
    grant_type,
    client_assertion_type,
    client_assertion,
    host
  );

  return res.status(request.status).json(request);
});

export { route as oauthRoutes };
