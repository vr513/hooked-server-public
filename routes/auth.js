const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db");
const verifyToken = require('../middlewares/authJWT');
const { signup, login } = require("../controllers/auth.controller.js");

router.post("/signup", signup, function (req, res, next) {});

router.post("/login", login, function (req, res, next) {});

router.post("/verifyToken", (req, res, next) => {
  if (req.body.accessToken !== null || req.body.accessToken !== undefined) {
    jwt.verify(req.body.accessToken, process.env.API_SECRET, (err, decode) => {
      if (err) {
        res.status(401).json({
          message: err,
        });
      }else {
        db.query(
          `SELECT * FROM users WHERE id= "${decode.id}";`,
          (err, result) => {
            if (!result.length) {
              return res.status(409).send({
                message: "Invalid token",
                success: false,
              });
            }else{
              res.status(200).send({
                success: true
              })
            }
          }
        );
      }
    });
  } else {
    res.send(404).send({
        message: "Invalid Token",
        success : false
    })
  }
});

router.get("/info",verifyToken,(req,res,next) => {
  db.query(
    `SELECT * FROM info WHERE id = ${db.escape(req.uid)}`,
    (err,result) => {
      if(err){
        res.status(500).send({err:err})
        return;
      }else{
        const response = result[0];
        res.status(200).send({user : response});
      }
    }
  )
})

module.exports = router;
