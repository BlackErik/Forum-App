const mongoose = require("mongoose");

const db = mongoose.connection;

const passwd = "BlackErik";

function connect(user, password, host, port, db) {
  const connectionString = `mongodb+srv://BlackErik:${passwd}@cluster0.69o07ey.mongodb.net/?retryWrites=true&w=majority`;
  try {
    mongoose.connect(connectionString);
  } catch (err) {
    console.log("error in connecting to mongoose", err);
  }
}

function onConnect(callback) {
  db.once("open", () => {
    console.log("mongo connection open");
    callback();
  });
}

module.exports = {
  connect,
  onConnect,
};
