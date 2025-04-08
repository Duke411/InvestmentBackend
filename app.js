const express = require('express');
const http = require('http')
const app = express();
const server = http.createServer(app)
const user = require('./routes/userRoutes')
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
    cors({
      origin: "http://localhost:8080", // Your React app's URL
      credentials: true, // Allow sending cookies with credentials
    })
  );


app.use('/invest/api/v1', user)

module.exports = {app, server}