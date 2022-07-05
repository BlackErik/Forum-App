const express = require("express");
const app = express();
const cors = require("cors");
const { User } = require("../persist/model");
const setUpAuth = require("./auth");
const setUpSession = require("./session");

app.use(cors());
app.use(express.json());

app.use(express.static(`${__dirname}/../public/`));

setUpSession(app);
setUpAuth(app);

app.post("/users", async (req, res) => {
  try {
    let user = await User.create({
      username: req.body.username,
      fullname: req.body.fullname,
      password: req.body.password,
    });
    res.status(201).json(User);
  } catch (err) {
    res.status(500).json({
      message: "post request failed to create user",
      error: err,
    });
  }
});

app.post("/thread", (req, res) => {});

app.get("/thread/:id", (req, res) => {});

app.get("/thread", (req, res) => {});

app.delete("/thread/:id", (req, res) => {});

app.post("/post", (req, res) => {});

app.delete("/thread/:thread_id/post/:post_id", (req, res) => {});

module.exports = app;
