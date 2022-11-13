import { Router } from "express";
import { authenticateUser } from "../auth/user";
import { authenticationFlow } from "../controllers/authentication";

const route = Router();

// fhir application authentication route
route.post("/oauth/access_token", async (req, res, next) => {
  const scope: string = req.body.scope;
  const grant_type: string = req.body.grant_type;
  const client_assertion_type: string = req.body.client_assertion_type;
  const client_assertion: string = req.body.client_assertion;
  const host: string = req.hostname;
  const clientId: number = Number(req.body.client_id);

  const request = await authenticationFlow(
    scope,
    grant_type,
    client_assertion_type,
    client_assertion,
    clientId,
    host
  );

  return res.status(request.status).json(request);
});

// user authentication route
route.post("/users/authenticate", async (req, res) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  const request = await authenticateUser(email, password);
  return res.status(request.status).json(request);
});

export { route as oauthRoutes };
