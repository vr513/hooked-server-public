const mysql = require('mysql');
const conn = mysql.createConnection({
  host: process.env.MYSQL_HOST, // Replace with your host name
  user: process.env.MYSQL_USER,      // Replace with your database username
  password: process.env.MYSQL_PASSWORD,      // Replace with your database password
  database: process.env.MYSQL_DATABASE_NAME  ,// // Replace with your database Name
  port: process.env.MYSQL_PORT,
  multipleStatements: true
}); 

conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});
module.exports = conn;