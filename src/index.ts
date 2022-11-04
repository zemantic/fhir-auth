import * as dotenv from "dotenv";
import express from "express";
import { oauthRoutes } from "./routes/authentication";
import { wellKnownRoute } from "./routes/wellKnown";
import { keysRoute } from "./routes/keys";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(wellKnownRoute);
app.use(oauthRoutes);
app.use(keysRoute);

app.get("/", (req, res) => {
  return res.status(200).json({ msg: `FhIR Auth Server` });
});

app.listen(port, () => {
  console.log(`FHIR Auth Server Running @ ${port}`);
});
