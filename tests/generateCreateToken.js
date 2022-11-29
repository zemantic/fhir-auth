const { config } = require("dotenv");
const jose = require("jose");
config();

const time = Math.round(Date.now() / 1000);
const jwtKey = new TextEncoder().encode(process.env.JWT_KEY);

const generateDeleteToken = async (clientId, client) => {
  try {
    const jwt = await new jose.SignJWT({
      scopes: {
        create: [1, 2],
        read: [],
        update: [],
        search: [],
        delete: [],
      },
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
    };
  } catch (error) {
    return {
      status: 500,
      token: null,
      error: error.message,
    };
  }
};

module.exports = generateCreateToken;
