const session = require("express-session");

const setUpSessionStore = function (app) {
  app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
    })
  );
};

module.exports = setUpSessionStore;
