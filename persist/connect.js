const mongoose = require("mongoose");

const db = mongoose.connection;

const passwd = "BlackErik";

async function connect(user, password, host, port, db) {
  const connectionString = `mongodb+srv://BlackErik:${passwd}@cluster0.69o07ey.mongodb.net/?retryWrites=true&w=majority`;
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.log("error in connecting to mongoose", err);
    throw "mongo couldn't connect";
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
