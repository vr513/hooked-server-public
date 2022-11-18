const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require("morgan");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const matchRoutes = require("./routes/match");


require("dotenv").config();

const app = express();
 
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

const port = 8081;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})