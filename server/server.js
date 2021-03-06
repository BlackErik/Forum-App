const express = require("express");
const app = express();
const cors = require("cors");
const { User, Thread, Post } = require("../persist/model");
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
      role: req.body.role,
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

app.get("/users/", async (req, res) => {
  let currentUser;
  try {
    currentUser = req.user;
    res.status(200).json(currentUser);
    console.log(currentUser);
  } catch (err) {
    res.status(500).json({
      message: "could not get user",
      error: err,
    });
    return;
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
    return;
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
    // TODO: GET POSTS`
    return;
  }

  for (let i in thread.posts) {
    try {
      thread.posts[i].user = await User.findById(
        thread.posts[i].user_id,
        "-password"
      );
    } catch (err) {
      console.log("unable to get user when getting thread", err);
    }
  }

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

app.delete("/thread/:id", async (req, res) => {
  // check auth
  if (!req.user && req.user.role != "admin") {
    console.log(req.user);
    console.log(req.user.role);
    res.status(401).json({ message: "unnauthenticated" });
    return;
  }
  console.log(`request to delete a single thread with id ${req.params.id}`);

  let thread;

  // pull thread
  try {
    thread = await Thread.findById(req.params.id);
  } catch (err) {
    res.status(500).json({
      message: "failed to delete thread",
      error: err,
    });
    return;
  }

  if (thread === null) {
    res.status(404).json({
      message: "thread not found",
      thread_id: req.params.thread_id,
    });
    return;
  }

  // check that the thread is "owned by the requesting user"
  if (thread.user_id != req.user.id && req.user.role != "admin") {
    res.status(401).json({ message: "not authorized" });
    return;
  }

  // delete the thread
  try {
    await Thread.findByIdAndDelete(req.params.id);
  } catch (err) {
    res.status(500).json({
      message: "failed to delete post",
      error: err,
    });
    return;
  }
  res.status(200).json({
    message: "deleted post",
  });
});

app.post("/post", async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "unauthenticated" });
    return;
  }

  let thread;

  try {
    thread = await Thread.findByIdAndUpdate(
      req.body.thread_id,
      {
        $push: {
          posts: {
            user_id: req.user.id,
            body: req.body.body,
            thread_id: req.body.thread_id,
          },
        },
      },
      {
        new: true,
      }
    );

    if (!thread) {
      res.status(404).json({
        message: `thread not found`,
        id: req.params.thread_id,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: `failed to insert post`,
      error: err,
    });
  }
  res.status(201).json(thread.posts[thread.posts.length - 1]);
});

app.delete("/thread/:thread_id/post/:post_id", async (req, res) => {
  let thread;
  let post;
  if (!req.user && req.user.role != "admin") {
    res.status(401).json({ message: "unathenticated" });
    return;
  }

  try {
    thread = await Thread.findOne({
      _id: req.params.thread_id,
      "posts._id": req.params.post_id,
    });
  } catch (err) {
    res.status(500).json({
      message: "error finding thread when deleting post",
      error: err,
    });
    return;
  }

  if (!thread) {
    res.status(404).json({
      message: "thread not found when deleting post",
      thread_id: req.params.thread_id,
    });
    return;
  }

  // assume they aren't authorized.
  let authorizedToDelete = false;

  // admins can always delete
  if (req.user.role == "admin") authorizedToDelete = true;

  for (let i in thread.posts) {
    if (thread.posts[i]._id == req.params.post_id) {
      post = thread.posts[i];
      if (thread.posts[i].user_id == req.user.id) {
        // if the user who created the post is the current user, they can delete
        authorizedToDelete = true;
      }
    }
  }

  if (!authorizedToDelete) {
    res.status(401).json({ message: "unnathorized" });
    return;
  }

  try {
    await Thread.findByIdAndUpdate(req.params.thread_id, {
      $pull: {
        posts: {
          _id: req.params.post_id,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "error deleting post",
      error: err,
    });
    return;
  }
  res.status(200).json(post);
});

module.exports = app;
