import { Router } from "express";
import { verifyJwt, verifyScopes } from "../auth/authentication";
import fetch from "node-fetch";
import { getClientById } from "../controllers/clients";
import {
  OperationOutcome,
  Issue,
} from "../helpers/fhirResources/operationOutcome";

const route = Router();
let fhirEndpoint;

route.all("/*", async (req, res, next) => {
  // return next(); // disable this after testing
  const token = req.headers.authorization;
  const verify = await verifyJwt(token);
  if (verify.status !== 200) {
    return res.status(verify.status).json(verify);
  }
  if (!verify.data.scopes) {
    const operationOutcome = new OperationOutcome();
    const issue = new Issue();
    issue.sevierity = "fatal";
    issue.code = "security";
    issue.diagnostics = "invalid authorization scopes provided";
    operationOutcome.issue = [issue];
    return res.status(401).json(operationOutcome.throwOperationOutcome());
  }
  if (!verify.data.clientId) {
    const operationOutcome = new OperationOutcome();
    const issue = new Issue();
    issue.sevierity = "fatal";
    issue.code = "security";
    issue.diagnostics =
      "invalid clientId or client does not exists, please contact administrator";
    operationOutcome.issue = [issue];
    return res.status(401).json(operationOutcome.throwOperationOutcome());
  }

  const client = await getClientById(verify.data.clientId);
  res.locals.scopes = verify.data.scopes;
  res.locals.clientId = verify.data.clientId;
  fhirEndpoint = client.data.client.fhirEndpoint;
  next();
});

// operators
route.get("/:resource/([$]):operator", async (req, res, next) => {
  const operator = req.params.operator;
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
  const checkResource = verfiedScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1) {
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

    let endpoint = `${fhirEndpoint}/${req.params.resource}/$${operator}`;

    const request = await fetch(endpoint, {
      method: "GET",
      headers: headers,
    });

    const responseText = await request.text();

    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);

    return res.status(request.status).send(responseText);
  }

  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

route.get("/:resource/:id/([$]):operator", async (req, res, next) => {
  const operator = req.params.operator;
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
  const checkResource = verfiedScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource !== -1) {
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

    let endpoint = `${fhirEndpoint}/${req.params.resource}/${req.params.id}/$${operator}`;

    const request = await fetch(endpoint, {
      method: "GET",
      headers: headers,
    });

    const responseText = await request.text();

    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);

    return res.status(request.status).send(responseText);
  }

  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

route.post("/:resource/([$]):operator", async (req, res, next) => {
  const operator = req.params.operator;
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
  const checkResource = verfiedScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource === -1) {
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

    let endpoint = `${fhirEndpoint}/${req.params.resource}/$${operator}`;

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

  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

route.post("/:resource/:id/([$]):operator", async (req, res, next) => {
  const operator = req.params.operator;
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
  const checkResource = verfiedScopes.findIndex(
    (privilage) =>
      privilage.resource.toLowerCase() === req.params.resource.toLowerCase()
  );

  if (checkResource === -1) {
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

    let endpoint = `${fhirEndpoint}/${req.params.resource}/${req.params.id}/$${operator}`;

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

  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

// misc
route.get("/metadata", async (req, res, next) => {
  const headers = new Headers();
  headers.set("content-type", req.headers["content-type"]);
  headers.set("accept", req.headers["accept"]);

  let endpoint = `${fhirEndpoint}/metadata`;

  const request = await fetch(endpoint, {
    method: "GET",
    headers: headers,
  });

  const responseText = await request.text();

  return res.status(request.status).send(responseText);
});

//history
route.get("/:resource/:id/_history", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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

    let endpoint = `${fhirEndpoint}/${req.params.resource}/${req.params.id}/_history${queryStrings}`;

    const request = await fetch(endpoint, {
      method: "GET",
      headers: headers,
    });

    const responseText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);
    return res.status(request.status).send(responseText);
  }
  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

route.get("/:resource/_history", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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

  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

route.get("/:resource/_search", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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

    let endpoint = `${fhirEndpoint}/${req.params.resource}/_search${queryStrings}`;

    const request = await fetch(endpoint, {
      method: "GET",
      headers: headers,
    });

    const responseText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);

    return res.status(request.status).send(responseText);
  }

  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

route.get("/_history", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );

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
    const operationOutcome = new OperationOutcome();
    const issue = new Issue();
    issue.sevierity = "fatal";
    issue.code = "security";
    issue.diagnostics =
      "the client does not have the permission to perform this action";
    operationOutcome.issue = [issue];
    return res.status(401).json(operationOutcome.throwOperationOutcome());
  }
});

// simple read
route.get("/:resource/:id", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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

  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

// vread
route.get("/:resource/:id/_history/:vid", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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

  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

// update
route.put("/:resource/:id", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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
    let payload;

    if (
      req.headers["content-type"] === "application/json" ||
      req.headers["content-type"] === "application/fhir+json"
    ) {
      payload = JSON.stringify(req.body);
    } else {
      payload = req.body;
    }

    const request = await fetch(endpoint, {
      method: "PUT",
      headers: headers,
      body: payload,
    });

    const requestText = await request.text();

    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);

    return res.status(request.status).send(requestText);
  }
  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

// patch
route.patch("/:resource/:id", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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

    let payload;
    if (
      req.headers["content-type"] === "application/json" ||
      req.headers["content-type"] === "application/fhir+json"
    ) {
      payload = JSON.stringify(req.body);
    } else {
      payload = req.body;
    }
    const request = await fetch(endpoint, {
      method: "PATCH",
      headers: headers,
      body: payload,
    });

    const requestText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);
    return res.status(request.status).send(requestText);
  }
  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

// delete
route.delete("/:resource/:id", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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
  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

// create
route.post("/:resource", async (req, res, nex) => {
  const verfiyScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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
    let payload;

    if (
      req.headers["content-type"] === "application/json" ||
      req.headers["content-type"] === "application/fhir+json"
    ) {
      payload = JSON.stringify(req.body);
    } else {
      payload = req.body;
    }

    const request = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: payload,
    });

    const responseText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);
    return res.status(request.status).send(responseText);
  }
  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

// search
route.post("/:resource/_search", async (req, res, next) => {
  const verfiyScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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
    headers.set("content-type", req.headers["content-type"]);
    headers.set("accept", req.headers["accept"]);

    let endpoint = `${fhirEndpoint}/${req.params.resource}/_search`;
    let payload;

    if (
      req.headers["content-type"] === "application/json" ||
      req.headers["content-type"] === "application/fhir+json"
    ) {
      payload = JSON.stringify(req.body);
    } else if (
      req.headers["content-type"] === "application/x-www-form-urlencoded"
    ) {
      payload = new URLSearchParams();
      Object.entries(req.body).forEach((key, value) =>
        payload.append(key, value)
      );
    } else {
      payload = req.body;
    }

    const request = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: payload,
    });

    const responseText = await request.text();
    res.set("content-type", request.headers.get("content-type"));
    res.set("x-powered-by", process.env.POWERED_BY);
    return res.status(request.status).send(responseText);
  }

  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

route.get("/:resource", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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

  const operationOutcome = new OperationOutcome();
  const issue = new Issue();
  issue.sevierity = "fatal";
  issue.code = "security";
  issue.diagnostics =
    "the client does not have the permission to perform this action";
  operationOutcome.issue = [issue];
  return res.status(401).json(operationOutcome.throwOperationOutcome());
});

route.get("/", async (req, res, next) => {
  const verifiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
  const splitOriginalUrl = req.originalUrl.split("?");

  if (req.query._type) {
    const splitTypes = (req.query._type as string).split(",");

    splitTypes.forEach((type: string) => {
      const checkResource = verifiedScopes.findIndex(
        (privilage) => privilage.resource.toLowerCase() === type.toLowerCase()
      );
      if (
        checkResource === -1 ||
        !verifiedScopes[checkResource].privilages.search
      ) {
        splitTypes.splice(checkResource, 1);
      }
    });

    if (splitTypes.length !== 0) {
      const headers = new Headers();
      headers.set("content-type", req.headers["content-type"]);
      headers.set("accept", req.headers["accept"]);
      let endpoint = `${fhirEndpoint}`;
      if (splitOriginalUrl[1]) {
        endpoint = `${fhirEndpoint}?${splitOriginalUrl[1]}`;
      }

      const request = await fetch(endpoint, {
        method: "GET",
        headers: headers,
      });

      const responseText = await request.text();

      res.set("content-type", request.headers.get("content-type"));
      res.set("powered-by", process.env.POWERED_BY);
      return res.status(request.status).send(responseText);
    } else {
      const operationOutcome = new OperationOutcome();
      const issue = new Issue();
      issue.sevierity = "fatal";
      issue.code = "security";
      issue.diagnostics =
        "the client does not have the permission to perform this action";
      operationOutcome.issue = [issue];
      return res.status(401).json(operationOutcome.throwOperationOutcome());
    }
  } else {
    const client = await getClientById(res.locals.clientId);
    const globalSearch = client.data.client.enableGlobalSearch;
    if (!globalSearch) {
      const operationOutcome = new OperationOutcome();
      const issue = new Issue();
      issue.sevierity = "fatal";
      issue.code = "security";
      issue.diagnostics =
        "the client does not have the permission to perform this action";
      operationOutcome.issue = [issue];
      return res.status(401).json(operationOutcome.throwOperationOutcome());
    }

    const splitOriginalUrl = req.originalUrl.split("?");
    if (splitOriginalUrl[1]) {
    } else {
      const operationOutcome = new OperationOutcome();
      const issue = new Issue();
      issue.sevierity = "fatal";
      issue.code = "security";
      issue.diagnostics =
        "the client does not have the permission to perform this action";
      operationOutcome.issue = [issue];
      return res.status(401).json(operationOutcome.throwOperationOutcome());
    }
  }
});

// compartment requests
route.get("/:compartmant/:id/:type", async (req, res, next) => {
  const verfiedScopes = await verifyScopes(
    res.locals.scopes,
    res.locals.clientId
  );
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
    const operationOutcome = new OperationOutcome();
    const issue = new Issue();
    issue.sevierity = "fatal";
    issue.code = "security";
    issue.diagnostics =
      "the client does not have the permission to perform this action";
    operationOutcome.issue = [issue];
    return res.status(401).json(operationOutcome.throwOperationOutcome());
  }

  if (checkResource === -1 || !verfiedScopes[checkResource].privilages.search) {
    const operationOutcome = new OperationOutcome();
    const issue = new Issue();
    issue.sevierity = "fatal";
    issue.code = "security";
    issue.diagnostics =
      "the client does not have the permission to perform this action";
    operationOutcome.issue = [issue];
    return res.status(401).json(operationOutcome.throwOperationOutcome());
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

// batch transactions
route.post("/", async (req, res, next) => {
  const client = await getClientById(res.locals.clientId);
  const batchRequestEnabled = client.data.client.enableBatchRequests;
  if (!batchRequestEnabled) {
    const operationOutcome = new OperationOutcome();
    const issue = new Issue();
    issue.sevierity = "fatal";
    issue.code = "security";
    issue.diagnostics =
      "the client does not have the permission to perform this action";
    operationOutcome.issue = [issue];
    return res.status(401).json(operationOutcome.throwOperationOutcome());
  }

  let queryStrings = "";
  const splitOriginalUrl = req.originalUrl.split("?");

  if (splitOriginalUrl[1]) {
    queryStrings = `?${splitOriginalUrl[1]}`;
  }
  const headers = new Headers();
  headers.set("content-type", req.headers["content-type"]);
  headers.set("accept", req.headers["accept"]);

  const endpoint = `${fhirEndpoint}/${queryStrings}`;
  let payload;
  if (
    req.headers["content-type"] === "application/json" ||
    req.headers["content-type"] === "application/fhir+json"
  ) {
    payload = JSON.stringify(req.body);
  } else {
    payload = req.body;
  }
  const request = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: payload,
  });

  const responseText = await request.text();

  res.set("content-type", request.headers.get("content-type"));
  res.set("x-powered-by", process.env.POWERED_BY);
  return res.status(request.status).send(responseText);
});

export { route as fhirRoutes };
