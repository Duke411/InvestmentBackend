const mongoose = require("mongoose");
const { app, server } = require("./app.js");
const dotenv = require("dotenv");
dotenv.config({});

const PORT = process.env.PORT || 3000;

const DB = process.env.DATA_BASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log(`Database connected`);
  })
  .catch((err) => {
    console.log(err);
  });

server.listen(PORT, () => {
  console.log(`app is listening to port ${PORT}`);
});
