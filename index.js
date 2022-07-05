const express = require("express");

const app = express();

const { connect, onConnect } = require("./persist/connect");

app.use(express.json());

const port = 8080;

onConnect(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

connect();
