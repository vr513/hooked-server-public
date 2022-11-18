const jwt = require("jsonwebtoken");
const db = require("../db");

const verifyToken = (req, res, next) => {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.API_SECRET,
      function (err, decode) {
        if (err) {
          res.status(401).json({
            message: err,
          });
        } else {
          db.query(
            `SELECT * FROM users WHERE id="${decode.id}";`,
            (err, result) => {
              if (!result.length) {  
                return res.status(409).send({
                  message: "Invalid token",
                  success: false,
                });
              }else{
                req.uid = decode.id;
                next();
              }
            }
          );
        }
      }
    );
  }else {
    req.user = undefined;
    res.status(200).send({
      success: false,
      message: "Token is required",
    });
  }
};

module.exports = verifyToken;
