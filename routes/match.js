const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middlewares/authJWT");
const util = require("util");

const query = util.promisify(db.query).bind(db);

router.post("/like", verifyToken, async (req, res, next) => {
  if (req.body.targetUser === null || req.body.targetUser === undefined) {
    res.status(400).send({ msg: "targetUser field is required" });
    return;
  }
  const targetUser = req.body.targetUser;
  try {
    const rows = await query(
      `SELECT * FROM info WHERE id = ${db.escape(req.uid)}`
    );
    let myLikes = rows[0]["likestome"];
    myLikes = JSON.parse(myLikes);

    const userExist = myLikes.find((user) => user === targetUser);
    if (userExist === undefined) {
      // TargetUser has not liked current user
      const res1 = await query(
        `
          UPDATE info SET likes = JSON_ARRAY_APPEND(likes,'$',${db.escape(
            targetUser
          )}) WHERE info.id = ${db.escape(req.uid)};
          UPDATE info SET likestome = JSON_ARRAY_APPEND(likestome,'$',${db.escape(
            req.uid
          )}) WHERE info.id = ${db.escape(targetUser)};
        `
      );
    } else {
      const index = myLikes.indexOf(targetUser);
      if (index > -1) {
        myLikes.splice(index, 1);
      }
      const res1 = await query(
        `
          UPDATE info SET likes = JSON_ARRAY_APPEND(likes,'$',${db.escape(
            targetUser
          )}) WHERE info.id = ${db.escape(req.uid)};
          UPDATE info SET matches = JSON_ARRAY_APPEND(matches,'$',${db.escape(
            targetUser
          )}) WHERE info.id = ${db.escape(req.uid)};
          UPDATE info SET matches = JSON_ARRAY_APPEND(matches,'$',${db.escape(
            req.uid
          )}) WHERE info.id = ${db.escape(targetUser)};
          UPDATE info SET likestome = '${JSON.stringify(
            myLikes
          )}' WHERE info.id = ${db.escape(req.uid)};
        `
      );
    }

    res.send({ data: "Operation Sucessfull" });
  } catch (err) {
    res.send({ msg: err });
  }
});

router.post("/dislike", verifyToken, async (req, res, next) => {
  if (req.body.targetUser === null || req.body.targetUser === undefined) {
    res.status(400).send({ msg: "targetUser field is required" });
    return;
  }
  const targetUser = req.body.targetUser;
  try {
    const result = await query(
      `UPDATE info SET dislikes = JSON_ARRAY_APPEND(dislikes,'$',${db.escape(
        targetUser
      )}) WHERE info.id = ${db.escape(req.uid)}`
    );

    res.send({ data: "Operation Sucessfull" });
  } catch (err) {
    res.send({ msg: err });
  }
});

router.post("/get-users", verifyToken, async (req, res, next) => {
  if (req.body.age_limit_lower === null || req.body.age_limit_lower === undefined) {
    res.status(400).send({ msg: "Age Limit Lower field is required" });
    return;
  }
  if (req.body.age_limit_upper === null || req.body.age_limit_upper === undefined) {
    res.status(400).send({ msg: "Age Limit Upper field is required" });
    return;
  }
  if (req.body.gender === null || req.body.gender === undefined) {
    res.status(400).send({ msg: "Gender field is required" });
    return;
  }
  const res1 = await query(
    `
      SELECT @uLikes := info.likes , @uDislikes := info.dislikes FROM info WHERE info.id = ${db.escape(
        req.uid
      )};
      SELECT * FROM info WHERE (NOT info.id MEMBER OF(@uLikes)) && (NOT info.id MEMBER OF(@uDislikes)) && info.id != ${db.escape(
        req.uid
      )} && info.age >= ${db.escape(
      req.body.age_limit_lower
    )} && info.age <= ${db.escape(
      req.body.age_limit_upper
    )} && info.gender = ${db.escape(req.body.match_gender)};
      SET @uLikes = NULL;
      SET @uDislikes = NULL;
    `
  );
  console.log(res1);
  res.send({ data: res1[1] });
});

router.post("/get-my-matches", verifyToken, async (req, res, next) => {
  const res1 = await query(
    `
    SELECT @uMatches := info.matches FROM info WHERE info.id = ${db.escape(
      req.uid
    )};
    SELECT * FROM info WHERE (info.id MEMBER OF (@uMatches));
    SET @uMatches = NULL;
    `
  );
  res.send({ data: res1[1] });
});

module.exports = router;
