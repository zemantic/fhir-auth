const generateSearchToken = require("./generateSearchToken");
const data = require("./bundleData.json");
test("post batch request with client enabled batch request", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );

  const request = await fetch("http://127.0.0.1:3000/fhir", {
    method: "POST",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
    body: JSON.stringify(data),
  });

  expect(request.status).toEqual(400);
});

test("post batch request with client disabled batch request", async () => {
  const token = await generateSearchToken(
    1,
    "e712bdfb-d333-4e3a-9f59-fec4f3115f1c"
  );

  const request = await fetch("http://127.0.0.1:3000/fhir", {
    method: "POST",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
    body: JSON.stringify(data),
  });

  expect(request.status).toEqual(401);
});
