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

const setUpAuth = function (app) {
  app.use(passport.initialize());
  app.use(passport.authenticate("session"));

  passport.serializeUser(function (user, cb) {
    cb(null, {
      id: user._id,
      username: user.username,
      fullname: user.fullname,
    });
  });
  passport.deserializeUser(function (user, cb) {
    return cb(null, user);
  });

  app.post("/session", passport.authenticate("local"), (req, res) => {
    res.status(201).json({
      message: "successfully create session",
      username: req.user.username,
      fullname: req.user.fullname,
    });
  });

  app.get("/session", (req, res) => {
    if (!req.user) {
      res.status(401).json({ message: "unauthenticated" });
      return;
    }
    console.log(req.user);
    res.status(200).json({ message: "authenticated" });
  });
};

module.exports = setUpAuth;
