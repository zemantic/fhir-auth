import { Strategy, ExtractJwt } from "passport-jwt";
import { getUserById } from "../controllers/users";

export const passportAuth = (passport) => {
  var opts: {
    jwtFromRequest: any;
    secretOrKey: string;
    issuer?: string;
    audience?: string;
  } = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.USER_JWT_KEY,
  };

  passport.use(
    new Strategy(opts, async (jwt_payload, done) => {
      const user = await getUserById(Number(jwt_payload.userId));

      if (user.status !== 200) {
        return done(user.toJSON(), false);
      }
      if (user) {
        return done(null, user.data.user.map.get("id"));
      } else {
        return done(null, false);
      }
    })
  );
};
