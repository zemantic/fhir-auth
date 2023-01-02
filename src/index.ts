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
import { fhirServerRoutes } from "./routes/fhirServer";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

dotenv.config();

// enable API rate limiting
const apiRateLimitWindow: number = Number(process.env.API_RATE_LIMIT_WINDOW);
const apiRateLimitMax: number = Number(process.env.API_RATE_LIMIT);
const apiRateLimit = rateLimit({
  windowMs: apiRateLimitWindow * 60000,
  max: apiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

// enable FHIR rate limiting
const fhirRateLimitWindow: number = Number(process.env.FHIR_RATE_LIMIT_WINDOW);
const fhirRateLimitMax: number = Number(process.env.FHIR_RATE_LIMIT);
const fhirRateLimit = rateLimit({
  windowMs: fhirRateLimitWindow,
  max: fhirRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    resourceType: "OperationOutcome",
    issue: [
      {
        severity: "fatal",
        code: "throttled",
        details: {
          text: "the client has reached the rate limit and the request cannot be proccessed fruther",
        },
      },
    ],
  },
});

// initialize express server
const port = process.env.PORT || 3000;
const app = express();

// enable cors
app.use(cors());
// enable logging
app.use(morgan("combined"));
// enable url encoded requests
app.use(express.urlencoded({ extended: true }));
// enable json requests
app.use(express.json());
// enable fhir specific headers
app.use(express.json({ type: "application/fhir+json" }));
app.use(express.text({ type: "application/fhir+xml" }));
// load routes
app.use(wellKnownRoute);
app.use(keysRoute);
app.use("/oauth", fhirRateLimit);
app.use("/oauth", oauthRoutes);
app.use("/api", apiRateLimit);
app.use("/api", clientRoutes);
app.use("/api", resourceRoutes);
app.use("/api", fhirServerRoutes);
app.use("/fhir", fhirRateLimit);
app.use("/fhir", fhirRoutes);
app.use("/user", apiRateLimit);
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({ msg: `FhIR Auth Server` });
});

app.listen(port, () => {
  console.log(`FHIR Auth Server Running @ ${port}`);
});
