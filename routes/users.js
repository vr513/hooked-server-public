const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middlewares/authJWT");
const multer = require('multer');
const firebase = require('../firebaseDb');
const {getStorage , ref , uploadBytes , getDownloadURL , getStream ,getBlob} = require('firebase/storage')


const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage }).single('file');

const storage = getStorage();
global.XMLHttpRequest = require("xhr2");


router.post("/register", verifyToken , upload, async (req, res, next) => {
    const targetFile = req.file;
    const name = req.uid;
    const type = targetFile.originalname.split(".")[1];
    const fileName = `${name}.${type}`;
    const storageRef = ref(storage , fileName);
    const snapshot = await uploadBytes(storageRef, targetFile.buffer);
    const link = await getDownloadURL(snapshot.ref);

    db.query(
        `INSERT INTO info (id,age,gender,picture,city,match_gender_preference,age_limit_lower,age_limit_upper,match_locality,username) VALUES ( ${db.escape(req.uid)} , ${parseInt(req.body.age)} , ${parseInt(req.body.gender)} ,${db.escape(link)} , ${db.escape(req.body.city.toLowerCase())} , ${parseInt(req.body.genderPrefrence)} , ${parseInt(req.body.ageLimitLower)} , ${parseInt(req.body.ageLimitUpper)} , ${parseInt(req.body.matchLocality)} , ${db.escape(req.body.username)});`,
            (err,result) => {
                if(err){
                    return res.status(500).send({msg:err});
                }else{
                    db.query(
                        `UPDATE users SET registered = 1 WHERE id = ${db.escape(req.uid)}`,
                        (err2,result2) =>{
                            if(err){
                                return res.status(500).send({msg:err2});
                            }else{
                                res.status(200).send({msg:"success"})
                            }
                        }
                    )
                }
            }
        );
});

router.post("/temp",verifyToken,upload,async(req,res,next) => {
    console.log(req.body);
    console.log(req.file);
    res.send({msg:"success"});
})

router.post('/storage-test', upload , async(req,res,next) => {
    try{
        const targetFile = req.file;
        console.log(targetFile.buffer)
        console.log(targetFile);
        const timestamp = Date.now();
        const name = req.uid;
        const type = targetFile.originalname.split(".")[1];
        const fileName = `test.${type}`;

        const storageRef = ref(storage , fileName);
        const snapshot = await uploadBytes(storageRef, targetFile.buffer);
        const link = await getDownloadURL(snapshot.ref);
        res.send(link);
    }catch(err){
        console.log(err);
        res.status(400).json({msg:err});
    }
})

module.exports = router;
