const express = require("express");
const app = express();
const cors = require("cors");
const { User, Thread } = require("../persist/model");
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
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({
      message: "post request failed to create user",
      error: err,
    });
  }
});

app.post("/thread", async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "unauthorized" });
    return;
  }

  try {
    let thread = await Thread.create({
      user_id: req.user.id,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
    });
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({
      message: "could not create thread",
      error: err,
    });
  }
});

app.get("/thread/:id", async (req, res) => {
  const id = req.params.id;
  let thread;
  try {
    thread = await Thread.findById(id);
    if (!thread) {
      res.status(404).json({
        message: "thread not found",
      });
      return;
    }
  } catch (err) {
    res.status(500).json({
      message: "could not get thread",
      error: err,
    });
  }

  try {
    thread = thread.toObject();
    let user = await User.findById(thread.user_id, "-password");
    thread.user = user;
  } catch (err) {
    res.status(500).json({
      message: "couldn't get user",
      error: err,
    });
  }
  // TODO: GET POSTS
  res.status(200).json(thread);
});

app.get("/thread", async (req, res) => {
  let threads;
  try {
    threads = await Thread.find({}, "-posts");
  } catch (err) {
    res.status(500).json({
      message: "could not get threads",
      error: err,
    });
  }

  for (let i in threads) {
    try {
      threads[i] = threads[i].toObject();
      let user = await User.findById(threads[i].user_id, "-password");
      threads[i].user = user;
    } catch (err) {
      console.log("unable to get user when getting thread", err);
    }
  }
  res.status(200).json(threads);
});

app.delete("/thread/:id", (req, res) => {});

app.post("/post", (req, res) => {});

app.delete("/thread/:thread_id/post/:post_id", (req, res) => {});

module.exports = app;
