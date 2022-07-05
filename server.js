const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.use(express.static(`${__dirname}/public/`));

module.exports = app;