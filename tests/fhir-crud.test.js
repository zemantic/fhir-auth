const generateDeleteToken = require("./generateDeleteToken");
const generateCreateToken = require("./generateOauthToken");
const generateUpdateToken = require("./generateUpdateToken");

const fhirEndpoint = "http://hapi.fhir.org/baseR4/";
let patientJson;

test("generating oauth token", async () => {
  const token = await generateCreateToken(
    "dd346d0e-4dc4-4277-971d-b85789411e81",
    2
  );
  expect(token.status).toEqual(200);
});

test("creating Patient", async () => {
  const token = await generateCreateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );
  const request = await fetch("http://127.0.0.1:3000/fhir/Patient", {
    method: "POST",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),

    body: JSON.stringify({
      resourceType: "Patient",
      active: true,
      name: [
        {
          use: "official",
          family: "Suthar",
          given: ["Kailash"],
        },
      ],
    }),
  });
  expect(request.status).toEqual(201);
  patientJson = await request.json();
});

test("update resource with put request", async () => {
  const token = await generateUpdateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch(
    `http://127.0.0.1:3000/fhir/Patient/${patientJson.id}`,
    {
      method: "PUT",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),

      body: JSON.stringify({
        resourceType: "Patient",
        id: patientJson.id,
        active: true,
        name: [
          {
            use: "official",
            family: "Suthar",
            given: ["Kailash"],
          },
        ],
      }),
    }
  );
  console.log(await request.text());
  expect(request.status).toEqual(200);
});

test("update invalid resource with put request", async () => {
  const token = await generateUpdateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );
  const request = await fetch(
    `http://127.0.0.1:3000/fhir/Location/${patientJson.id}`,
    {
      method: "PUT",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),

      body: JSON.stringify({
        resourceType: "Location",
        resourceId: patientJson.id,
        active: true,
        name: [
          {
            use: "official",
            family: "Suthar",
            given: ["Kailash"],
          },
        ],
      }),
    }
  );
  expect(request.status).toEqual(401);
});

test("updating patiet with PATCH request", async () => {
  const token = await generateUpdateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );
  const request = await fetch(
    `http://127.0.0.1:3000/fhir/Patient/${patientJson.id}`,
    {
      method: "PATCH",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),

      body: JSON.stringify({
        resourceType: "Patient",
        id: patientJson.id,
        active: true,
        name: [
          {
            use: "official",
            family: "Suthar",
            given: ["Kailash"],
          },
        ],
      }),
    }
  );
  expect(request.status).toEqual(200 || 201);
  patientJson = await await request.json();
});

test("creating invalid resource", async () => {
  const token = await generateCreateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );
  const request = await fetch("http://127.0.0.1:3000/fhir/Location", {
    method: "POST",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),

    body: JSON.stringify({
      resourceType: "Location",
      active: true,
      name: [
        {
          use: "official",
          family: "Suthar",
          given: ["Kailash"],
        },
      ],
    }),
  });
  expect(request.status).toEqual(401);
});

test("delete fhir resource without permission", async () => {
  const token = await generateCreateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );
  const request = await fetch(
    `http://127.0.0.1:3000/fhir/Patient/${patientJson.id}`,
    {
      method: "DELETE",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),
    }
  );
  expect(request.status).toEqual(401);
});

test("delete fhir resource with permission", async () => {
  const token = await generateDeleteToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );
  const request = await fetch(
    `http://127.0.0.1:3000/fhir/Patient/${patientJson.id}`,
    {
      method: "DELETE",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),
    }
  );
  expect(request.status).toEqual(200);
});

test("delete invalid fhir resource", async () => {
  const token = await generateCreateToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );
  const request = await fetch(
    `http://127.0.0.1:3000/fhir/Location/${patientJson.id}`,
    {
      method: "DELETE",
      headers: new Headers({
        "content-type": "application/fhir+json",
        Authorization: `bearer ${token.token}`,
      }),
    }
  );
  expect(request.status).toEqual(401);
});

// test("updating patient with PATCH request", async () => {
//   const token = await generateKey(2, "dd346d0e-4dc4-4277-971d-b85789411e81");
//   const request = await fetch(`http://127.0.0.1:3000/fhir/Patient/${patientJson.id}`, {
//     method: "PATCH",
//     headers: new Headers({
//       "content-type": "application/fhir+json",
//       Authorization: `bearer ${token.token}`,
//     }),

//     body: JSON.stringify({
//       resourceType: "Location",
//       active: true,
//       name: [
//         {
//           use: "official",
//           family: "Testing",
//           given: ["Kailash"],
//         },
//       ],
//     }),
//   });
//   expect(request.status).toEqual(201);
// });
