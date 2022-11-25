import { response, Router } from "express";
import { verifyJwt, verifyScopes } from "../auth/authentication";
import fetch from "node-fetch";

const route = Router();
const fhirEndpoint = "http://hapi.fhir.org/baseR4";

route.all("/fhir/*", async (req, res, next) => {
  return next(); // disable this after testing
  const token = req.headers.authorization;
  const verify = await verifyJwt(token);
  if (verify.status !== 200) {
    return res.status(verify.status).json(verify);
  }
  res.locals.scopes = verify.data.scopes;
  res.locals.clientId = verify.data.clientId;
  next();
});

// simple read
route.get("/fhir/:resource/:id", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiedScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiedScopes[checkResource].privilages.read) {
    let queryStrings = "";
    if (req.query) {
      const splitOriginalUrl = req.originalUrl.split("?");
      if (splitOriginalUrl[1]) {
        queryStrings = `?${splitOriginalUrl[1]}`;
      }
    }

    const headers = new Headers();
    headers.set("content-type", req.headers["content-type"]);
    headers.set("accept", req.headers["accept"]);

    let endpoint = `${fhirEndpoint}/${req.params.resource}/${req.params.id}`;

    const request = await fetch(endpoint, {
      method: "GET",
      headers: headers,
    });

    const requestText = await request.text();

    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);

    return res.status(request.status).send(requestText);
  }
});

// vread
route.get("/fhir/:resource/:id/_history/:vid", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiedScopes.findIndex((privilage) => {
    privilage.resource.toLowerCase() === req.params.resource;
  });

  if (checkResource !== -1 && verfiedScopes[checkResource].privilages.read) {
    let queryStrings = "";

    if (req.query) {
      const splitOriginalUrl = req.originalUrl.split("?");
      if (splitOriginalUrl[1]) {
        queryStrings = `?${splitOriginalUrl[1]}`;
      }
    }

    const headers = new Headers();
    headers.set("content-type", req.headers["content-type"]);
    headers.set("accept", req.headers["accept"]);

    let endpoint = `${fhirEndpoint}/${req.params.resource}/${req.params.id}/_history/${req.params.vid}${queryStrings}`;
    const request = await fetch(endpoint, {
      method: "GET",
      headers: headers,
    });

    const requestText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);
    return res.status(request.status).send(requestText);
  }
  //TODO: return operation outcome
});

// update
route.put("/fhir/:resource/:id", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiyScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiyScopes[checkResource].privilages.update) {
    let queryStrings = "";
    if (req.query) {
      const splitOriginalUrl = req.originalUrl.split("?");
      queryStrings = `?${splitOriginalUrl[1]}`;
    }

    const headers = new Headers();
    headers.set("content-type", req.headers["content-type"]);
    headers.set("accept", req.headers["accept"]);

    let endpoint = `${fhirEndpoint}/${req.params.resource}/${req.params.id}`;

    const request = await fetch(endpoint, {
      method: "PUT",
      headers: headers,
      body: req.body,
    });

    const requestText = await request.text();

    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);

    return res.status(request.status).send(requestText);
  }
  // TODO: SEND OPERATION OUTCOME
  return res.status(401).send(req.query);
});

// patch
route.patch("/fhir/:resource/:id", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiyScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiyScopes[checkResource].privilages.update) {
    let queryStrings = "";
    if (req.query) {
      const splitOriginalUrl = req.originalUrl.split("?");
      queryStrings = `?${splitOriginalUrl[1]}`;
    }

    const headers = new Headers();
    headers.set("content-type", req.headers["content-type"]);
    headers.set("accept", req.headers["accept"]);

    let endpoint = `${fhirEndpoint}/${req.params.resource}/${req.params.id}`;

    const request = await fetch(endpoint, {
      method: "PATCH",
      headers: headers,
      body: req.body,
    });

    const requestText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);
    return res.status(request.status).send(requestText);
  }
  // TODO: SEND OPERATION OUTCOME
  return res.status(401).send(req.query);
});

// delete
route.delete("/fhir/:resource/:id", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiyScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiyScopes[checkResource].privilages.delete) {
    let queryStrings = "";

    if (req.query) {
      const splitOriginalUrl = req.originalUrl.split("?");
      queryStrings = `?${splitOriginalUrl[1]}`;
    }

    const headers = new Headers();
    headers.set("content-type", req.headers["content-type"]);
    headers.set("accept", req.headers["accept"]);

    let endpoint = `${fhirEndpoint}/${req.params.resource}/${req.params.id}${queryStrings}`;

    const request = await fetch(endpoint, {
      method: "DELETE",
      headers: headers,
    });

    const responseText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);
    return res.status(request.status).send(responseText);
  }
  // TODO: SEND OPERATION OUTCOME
  return res.status(401).send(req.query);
});

// create
route.post("/fhir/:resource", async (req, res, nex) => {
  const verfiyScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiyScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiyScopes[checkResource].privilages.create) {
    let queryStrings = "";
    if (req.query) {
      const splitOriginalUrl = req.originalUrl.split("?");
      if (splitOriginalUrl[1]) {
        queryStrings = `?${splitOriginalUrl[1]}`;
      }
    }

    const headers = new Headers();
    headers.set("content-type", req.headers["content-type"]);
    headers.set("accept", req.headers["accept"]);

    let endpoint = `${fhirEndpoint}/${req.params.resource}`;
    const request = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: req.body,
    });

    const responseText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);
    return res.status(request.status).send(responseText);
  }
  // TODO: RETURN OPERATION OUTCOME
  return res.status(401).send(req.query);
});

// search
route.post("/fhir/:resource/_search", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiyScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );
  if (checkResource !== -1 && verfiyScopes[checkResource].privilages.search) {
    let queryStrings = "";
    if (req.query) {
      const splitOriginalUrl = req.originalUrl.split("?");
      if (splitOriginalUrl[1]) {
        queryStrings = `?${splitOriginalUrl[1]}`;
      }
    }
    const headers = new Headers();
    headers.set("content-type", "application/x-www-form-urlencoded");
    headers.set("accept", req.headers["accept"]);

    let endpoint = `${fhirEndpoint}/${req.params.resource}/_search`;
    const request = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: req.body,
    });

    const responseText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);
    return res.status(request.status).send(responseText);
  }

  // TODO: ADD OPERATION OUTCOME
  return res.status(401).send(req.query);
});

route.get("/fhir/:resource", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiedScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiedScopes[checkResource].privilages.search) {
    let queryStrings = "";
    if (req.query) {
      const splitOriginalUrl = req.originalUrl.split("?");
      if (splitOriginalUrl[1]) {
        queryStrings = `?${splitOriginalUrl[1]}`;
      }
    }

    const headers = new Headers();
    headers.set("content-type", req.headers["content-type"]);
    headers.set("accept", req.headers["accept"]);

    let endpoint = `${fhirEndpoint}/${req.params.resource}${queryStrings}`;
    const request = await fetch(endpoint, {
      method: "GET",
      headers: headers,
    });

    const responseText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);
    return res.status(request.status).send(responseText);
  }

  // TODO: SEND OPERATION OUTCOME
});

// compartment requests
route.get("/fhir/:compartmant/:id/:type", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiedScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.type.toLowerCase()
  );
  const checkCompartmant = verfiedScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.compartmant.toLowerCase()
  );

  if (
    checkCompartmant === -1 ||
    !verfiedScopes[checkCompartmant].privilages.search
  ) {
    // TODO: return operation outcome
  }

  if (checkResource === -1 || !verfiedScopes[checkResource].privilages.search) {
    // TODO: return operation outcome
  }

  let queryStrings = "";
  if (req.query) {
    const splitOriginalUrl = req.originalUrl.split("?");
    if (splitOriginalUrl[1]) {
      queryStrings = `?${splitOriginalUrl[1]}`;
    }
  }

  const headers = new Headers();
  headers.set("content-type", req.headers["content-type"]);
  headers.set("accept", req.headers["accept"]);

  const endpoint = `${fhirEndpoint}/${req.params.compartmant}/${req.params.id}/${req.params.type}`;
  const request = await fetch(endpoint, {
    method: "GET",
    headers: headers,
  });

  const responseText = await request.text();
  res.set("content-type", request.headers.get("content-type"));
  res.set("x-powered-by", process.env.POWERED_BY);
  return res.status(request.status).send(responseText);
});

route.get("/fhir", async (req, res, next) => {
  const params = req.query._type;
});

// batch transactions
route.post("/fhir", async (req, res, next) => {});

//history
route.get("/fhir/:resource/:id/_history", async (req, res, next) => {});

route.get("/fhir/:resource/_history", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(res.locals.scopes);
  const checkResource = verfiedScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1 && verfiedScopes[checkResource].privilages.search) {
    let queryStrings = "";
    if (req.query) {
      const splitOriginalUrl = req.originalUrl.split("?");
      if (splitOriginalUrl[1]) {
        queryStrings = `?${splitOriginalUrl[1]}`;
      }
    }

    const headers = new Headers();
    headers.set("content-type", req.headers["content-type"]);
    headers.set("accept", req.headers["accept"]);

    let endpoint = `${fhirEndpoint}/${req.params.resource}/_history${queryStrings}`;

    const request = await fetch(endpoint, {
      method: "GET",
      headers: headers,
    });

    const responseText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);
    return res.status(request.status).send(responseText);
  }

  // TODO: SEND operation outcome
});

route.get("/fhir/_history", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(res.locals.scopes);

  let queryStrings = "";
  if (req.query) {
    const splitOriginalUrl = req.originalUrl.split("?");
    if (splitOriginalUrl[1]) {
      queryStrings = `?${splitOriginalUrl[1]}`;
    }
  }

  const headers = new Headers();
  // set the contet type to JSON by default because only json is currently supported
  // headers.set("content-type", req.headers['content-type'])
  // headers.set("accept", req.headers['accept'])
  headers.set("content-type", "application/fhir+json; charset=utf-8");
  headers.set("accept", "application/fhir+json; charset=utf-8");

  let endpoint = `${fhirEndpoint}/_history${queryStrings}`;
  const request = await fetch(endpoint, {
    method: "GET",
    headers: headers,
  });

  // TODO: Currently only json responses are supported, support for xml return should be added
  try {
    // parse the bundle and remove all non privilaged types
    const responseBundle: { entry?: [{ resource: { resourceType: string } }] } =
      await request.json();
    for (let index = 0; index < responseBundle.entry.length; index++) {
      const element = responseBundle.entry[index];
      const checkResource = verfiedScopes.findIndex(
        (privilage) =>
          privilage.resource.toLowerCase() ===
          element.resource.resourceType.toLowerCase()
      );
      if (
        checkResource === -1 ||
        !verfiedScopes[checkResource].privilages.search
      ) {
        responseBundle.entry.splice(index, 1);
      }
    }

    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);

    return res.status(request.status).send(responseBundle);
  } catch (error) {
    // TODO: Return operation outcome
  }
});

export { route as fhirRoutes };
