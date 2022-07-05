const express = require("express");
const cors = require("cors");
const { User } = require("../persist/model");
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(`${__dirname}/public/`));

app.post("/users", async (req, res) => {
  try {
    await User.create({
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

module.exports = app;
