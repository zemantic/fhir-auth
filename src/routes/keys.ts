import { Router } from "express";
import publicKey from "../../keys/publicKey.json";

const route = Router();

route.get("/jwk.json", (req, res) => {
  return res.status(200).json(publicKey);
});

export { route as keysRoute };
