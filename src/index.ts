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
import path from "path";

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
app.use(`${process.env.BASE_URL_PATH}/${wellKnownRoute}`);
app.use(`${process.env.BASE_URL_PATH}/${keysRoute}`);
app.use(`${process.env.BASE_URL_PATH}/oauth`, fhirRateLimit);
app.use(`${process.env.BASE_URL_PATH}/oauth`, oauthRoutes);
app.use(`${process.env.BASE_URL_PATH}/api`, apiRateLimit);
app.use(`${process.env.BASE_URL_PATH}/api`, clientRoutes);
app.use(`${process.env.BASE_URL_PATH}/api`, resourceRoutes);
app.use(`${process.env.BASE_URL_PATH}/api`, fhirServerRoutes);
app.use(`${process.env.BASE_URL_PATH}/fhir`, fhirRateLimit);
app.use(`${process.env.BASE_URL_PATH}/fhir`, fhirRoutes);
app.use(`${process.env.BASE_URL_PATH}/user`, apiRateLimit);
app.use(`${process.env.BASE_URL_PATH}/user`, userRoutes);

// set assets folder to serve ui assets
app.use(
  "/assets",
  express.static(path.join(__dirname, "fhir-auth-ui/assets/"))
);

// load front-end in base route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "fhir-auth-ui/index.html"));
  // return res.status(200).json({ msg: `FhIR Auth Server` });
});

app.listen(port, () => {
  console.log(`FHIR Auth Server Running @ ${port}`);
});
