const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");

exports.signup = (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
      req.body.email
    )});`,
    (err, result) => {
      if (result.length) {
        return res.status(409).send({
          message: "This user is already in use!",
        });
      } else {
        // username is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              message: err,
            });
          } else {
            // has hashed pw => add to database
            db.query(
              `INSERT INTO users (id,email, password,registered) VALUES ( UUID() , ${db.escape(
                req.body.email
              )}, ${db.escape(hash)} , 0 )`,
              (err, result) => {
                if (err) {
                  return res.status(400).send({
                    msg: err,
                  });
                }
                return res.status(201).send({
                  msg: "The user has been registerd with us!",
                });
              }
            );
          }
        });
      }
    }
  );
};

exports.login = (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    (err, result) => {
      const user = result[0];
      // user does not exists
      if (err) {
        
        res.status(400).send({
          msg: err,
        });
        return;
      }
      if (!result.length) {
        res.status(404).send({
          msg: "Email address not found",
        });
        return;
      }
      // check password
      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user["password"]
      );
      if (!passwordIsValid) {
        res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
        return;
      }
      const token = jwt.sign(
        {
          id: user.id,
        },
        process.env.API_SECRET,
        {
          expiresIn: "30d",
        }
      );
      res.status(202).json({
        token: token,
        userminimal: {
          email : user.email,
          registered: user.registered
        }
      });
    }
  );
};