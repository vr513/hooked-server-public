const firebase = require('firebase/app');
const config = require("./firebase");
const firebaseDb = firebase.initializeApp(config.firebaseConfig);
module.exports = firebaseDb;