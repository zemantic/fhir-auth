const generateCreateToken = require("./generateCreateToken");
const generateReadToken = require("./generateReadToken");
const generateSearchToken = require("./generateSearchToken");

test("search history of valid resource", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch("http://127.0.0.1:3000/fhir/Patient/_history", {
    method: "GET",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
  });

  expect(request.status).toEqual(200);
});

test("search global endpoint with list of type resource", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch("http://127.0.0.1:3000/fhir?_type=Patient", {
    method: "GET",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
  });
  console.log(await request.text());
  //   this feature is still not implemented on hapifhir and throws a 400 error
  // https://github.com/hapifhir/hapi-fhir/issues/685
  expect(request.status).toEqual(400);
});

test("search compartment of a valid resource", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    "http://127.0.0.1:3000/fhir/Patient/768/Observation",
    {
      method: "GET",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),
    }
  );

  console.log(await request.text());
  expect(request.status).toEqual(400);
});

test("search compartment of a valid resource but invalid child", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    "http://127.0.0.1:3000/fhir/Patient/768/Location",
    {
      method: "GET",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),
    }
  );

  expect(request.status).toEqual(401);
});

test("search compartment of an invalid resource", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    "http://127.0.0.1:3000/fhir/Location/768/Observation",
    {
      method: "GET",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),
    }
  );

  expect(request.status).toEqual(401);
});

test("search history of valid resource without permission", async () => {
  const token = await generateCreateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch("http://127.0.0.1:3000/fhir/Patient/_history", {
    method: "GET",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
  });

  expect(request.status).toEqual(401);
});

test("search history of invalid resource", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch("http://127.0.0.1:3000/fhir/Location/_history", {
    method: "GET",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
  });

  expect(request.status).toEqual(401);
});

test("search history of valid single resource", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    "http://127.0.0.1:3000/fhir/Patient/7161503/_history",
    {
      method: "GET",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),
    }
  );

  expect(request.status).toEqual(200);
});

test("search history of invalid single resource", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    "http://127.0.0.1:3000/fhir/Location/7161503/_history",
    {
      method: "GET",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),
    }
  );

  expect(request.status).toEqual(401);
});

test("search history of invalid single resource", async () => {
  const token = await generateCreateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    "http://127.0.0.1:3000/fhir/Patient/7161503/_history",
    {
      method: "GET",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),
    }
  );

  expect(request.status).toEqual(401);
});

test("search global histroy", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch("http://127.0.0.1:3000/fhir/_history", {
    method: "GET",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
  });
  // testing against an hapifhir server, still not implemented on hapifhir
  expect(request.status).toEqual(401);
});
