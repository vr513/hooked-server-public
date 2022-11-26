const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const matchRoutes = require("./routes/match");
const updateRoutes = require('./routes/update')

require("dotenv").config();

const app = express();
app.options("*", cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(authRoutes);
app.use(userRoutes);
app.use(matchRoutes);
app.use(updateRoutes)

app.get("/", (req, res, next) => {
  console.log("Welcome to the Hooked Project");
});

const port = 8081;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
