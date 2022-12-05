import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { oauthRoutes } from "./routes/authentication";
import { wellKnownRoute } from "./routes/wellKnown";
import { keysRoute } from "./routes/keys";
import { clientRoutes } from "./routes/clients";
import { userRoutes } from "./routes/users";
import { resourceRoutes } from "./routes/resources";
import { fhirRoutes } from "./routes/fhir";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: "application/fhir+json" }));
app.use(express.text({ type: "application/fhir+xml" }));
app.use(express.urlencoded({ extended: true }));

app.use(wellKnownRoute);
app.use(oauthRoutes);
app.use(keysRoute);
app.use("/api", clientRoutes);
app.use("/user", userRoutes);
app.use("/api", resourceRoutes);
app.use("/fhir", fhirRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({ msg: `FhIR Auth Server` });
});

app.listen(port, () => {
  console.log(`FHIR Auth Server Running @ ${port}`);
});
