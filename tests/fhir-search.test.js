const generateSearchToken = require("./generateSearchToken");

test("search valid resrouce with post request", async () => {
  const token = await generateSearchToken(
    2,
    "dd346d0e-4dc4-4277-971d-b85789411e81"
  );
  console.log(token);
  const request = await fetch("http://127.0.0.1:3000/fhir/Patient?_search", {
    method: "POST",
    headers: new Headers({
      "content-type": "application/fhir+json",
      Authorization: `bearer ${token.token}`,
    }),
    body: JSON.stringify({ id: 141547 }),
  });

  expect(request.status).toEqual(200);
});
