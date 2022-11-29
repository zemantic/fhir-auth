const { config } = require("dotenv");
const jose = require("jose");
config();

const time = Math.round(Date.now() / 1000);
const jwtKey = new TextEncoder().encode(process.env.JWT_KEY);

const generateReadToken = async (clientId, client) => {
  try {
    let scopes = {
      create: [],
      read: [1, 2],
      update: [],
      search: [],
      delete: [],
    };
    const jwt = await new jose.SignJWT({
      scopes: scopes,
      client: client,
      clientId: clientId,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setAudience(client.clientHost)
      .setIssuedAt(time + 300)
      .setExpirationTime(`300s`)
      .sign(jwtKey);

    return {
      status: 200,
      token: jwt,
      scopes,
    };
  } catch (error) {
    return {
      status: 500,
      token: null,
      error: error.message,
    };
  }
};

module.exports = generateReadToken;
