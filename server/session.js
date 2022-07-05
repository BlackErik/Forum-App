const passport = require("passport");
const LocalStrategy = require("passport-local");
const { User } = require("../persist/model");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    let user;
    try {
      user = await User.findOne({ username: username, password: password });
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
