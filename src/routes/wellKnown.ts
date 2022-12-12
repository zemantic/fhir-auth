/**
 * Contains the .well-known endpoints
 */

import { Router } from "express";

const routes = Router();

routes.get("/.well-known/smart-configuration", (req, res) => {
  const data = {
    token_endpoint: `${process.env.BASE_URL}/auth/access_token`,
    token_endpoint_auth_methods_supported: ["private_key_jwt"],
    token_endpoint_auth_signing_alg_values_supported: ["RS384", "ES384"],
    scopes_supported: [
      "system/*.create, system/*.read, system/*.update, system/*delete, system/*.search",
    ],
    registration_endpoint: `${process.env.BASE_URL}/register`,
  };
  return res.status(200).json(data);
});

routes.get("/.well-known/fauth", (req, res) => {
  const data = {
    token_endpoint: `${process.env.BASE_URL}/auth/access_token`,
    token_endpoint_auth_methods_supported: ["private_key_jwt"],
    token_endpoint_auth_signing_alg_values_supported: ["RS384", "ES384"],
    scopes_supported: [
      "system/*.create, system/*.read, system/*.update, system/*delete, system/*.search",
    ],
    registration_endpoint: `${process.env.BASE_URL}/register`,
  };
  return res.status(200).json(data);
});

export { routes as wellKnownRoute };
