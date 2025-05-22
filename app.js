// const express = require("express");
// const http = require("http");
// const app = express();
// const server = http.createServer(app);
// const user = require("./routes/userRoutes");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use(
//   cors({
//     origin: ["https://tradeemma.netlify.app", "http://localhost:5173/"], // Your React app's URL
//     credentials: true, // Allow sending cookies with credentials
//   })
// );
// app.options("*", cors());

// app.use("/invest/api/v1", user);

// module.exports = { app, server };

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const user = require("./routes/userRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Corrected CORS
app.use(
  cors({
    origin: "https://tradeemma.netlify.app",
    credentials: true,
  })
);
app.options("*", cors());

app.use("/invest/api/v1", user);

module.exports = { app, server };
