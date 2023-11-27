const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const Account = require("../models/Account");

let jwtOptions = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        let user = await Account.findOne({
          username,
        })
          .populate("roleId")
          .exec();

        if (!user)
          return done(null, false, {
            message: "Invalid credentials.",
          });

        const didMatch = await user.matchPassword(password);

        if (!didMatch)
          return done(null, false, { message: "Invalid credentials" });

        return done(null, user);
      } catch (error) {
        return done(error, null, {
          message: "Failed to login.\nInternal error.",
        });
      }
    }
  )
);

passport.use(
  "jwt",
  new JwtStrategy(jwtOptions, (payload, done) => {
    Account.findById(payload._id)
      .then(res => {
        if (!res) return done(null, false);
        return done(null, res);
      })
      .catch(err => {
        return done(err, null);
      });
  })
);
