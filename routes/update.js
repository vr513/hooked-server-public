const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middlewares/authJWT");
const multer = require("multer");
const firebase = require("../firebaseDb");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  getStream,
  getBlob,
  deleteObject,
} = require("firebase/storage");
const util = require("util");

const query = util.promisify(db.query).bind(db);

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage }).single("file");

const storage = getStorage();
global.XMLHttpRequest = require("xhr2");

router.post("/update-img", verifyToken, upload, async (req, res, next) => {
  const targetFile = req.file;
  const oldPictureReference = ref(storage, req.body.pictureRef);
  try {
    await deleteObject(oldPictureReference);
    const name = req.uid;
    const type = targetFile.originalname.split(".")[1];
    const fileName = `${name}.${type}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, targetFile.buffer);
    const link = await getDownloadURL(snapshot.ref);
    const res2 = await query(
      `UPDATE info SET picture = ${db.escape(link)} WHERE info.id = ${db.escape(
        req.uid
      )}`
    );
    res.status(200).send({ link });
  } catch (err) {
    res.status(404).send({ err });
  }
});

router.post("/update-info", verifyToken, async (req, res, next) => {
  try {
    const data = await query(
      `UPDATE info SET age = ${parseInt(req.body.age)} , gender = ${parseInt(
        req.body.gender
      )} , city = ${db.escape(
        req.body.city.toLowerCase()
      )} , match_gender_preference = ${parseInt(
        req.body.genderPreference
      )} , age_limit_lower = ${parseInt(
        req.body.ageLimitLower
      )} , age_limit_upper = ${parseInt(
        req.body.ageLimitUpper
      )} , match_locality = ${parseInt(
        req.body.matchLocality
      )} , username = ${db.escape(
        req.body.username
      )} , college_name = ${db.escape(
        req.body.collegeName
      )} , grad_year = ${parseInt(req.body.gradYear)} WHERE id = ${db.escape(req.uid)}`
    );
  } catch (err) {
    res.status(404).send({ err });
  }
});

router.post("/delete-user" , verifyToken , async (req,res,next) => {
  const oldPictureReference = ref(storage, req.body.pictureRef);
  try{
    await deleteObject(oldPictureReference);
    const data = query(`
      DELETE FROM info WHERE info.id = ${db.escape(req.uid)};
      DELETE FROM users WHERE users.id = ${db.escape(req.uid)};
    `);
    res.status(200).send({msg :'Operation completed successfully'});  
  }catch(err){
    res.status(404).send(err)
  }
})

module.exports = router;
