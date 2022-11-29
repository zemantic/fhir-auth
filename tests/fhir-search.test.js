const generateSearchToken = require("./generateSearchToken");
const generateCreateToken = require("./generateCreateToken");

test("search valid resrouce with post request", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch("http://127.0.0.1:3000/fhir/Patient/_search", {
    method: "POST",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
    body: JSON.stringify({ id: 141547 }),
  });

  expect(request.status).toEqual(200);
});

test("search invalid resrouce with post request", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch("http://127.0.0.1:3000/fhir/Location/_search", {
    method: "POST",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
    body: JSON.stringify({ id: 141547 }),
  });

  expect(request.status).toEqual(401);
});

test("search valid resrouce without permissions with post request", async () => {
  const token = await generateCreateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch("http://127.0.0.1:3000/fhir/Patient/_search", {
    method: "POST",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
    body: JSON.stringify({ id: 141547 }),
  });
  expect(request.status).toEqual(401);
});

test("search valid request via get to _search endpoint", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    "http://127.0.0.1:3000/fhir/Patient/_search?_id=141547",
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

test("search invalid request via get to _search endpoint", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    "http://127.0.0.1:3000/fhir/Location/_search?_id=141547",
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
test("search valid request via get to _search endpoint without permission", async () => {
  const token = await generateCreateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    "http://127.0.0.1:3000/fhir/Patient/_search?_id=141547",
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

// test("global search with no type parameter with permission", async () => {
//   const token = await generateSearchToken(
//     2,
//     "dd346d0e-4dc4-4277-971d-b85789411e81"
//   );

//   const request = await fetch("http://127.0.0.1:3000/fhir?_id=141547");
// });

test("search valid resrouce with GET request", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    "http://127.0.0.1:3000/fhir/Patient?_id?=141547",
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

test("search invalid resrouce with get request", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    "http://127.0.0.1:3000/fhir/Location/_id?=141547",
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

test("search valid resrouce without permissions with GET request", async () => {
  const token = await generateCreateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch("http://127.0.0.1:3000/fhir/Patient?_id=141547", {
    method: "GET",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
  });
  expect(request.status).toEqual(401);
});
