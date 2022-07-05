const app = require("./server/server");

const { connect, onConnect } = require("./persist/connect");

const port = 8080;

onConnect(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

connect();
