const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "diplomatico",
  waitForConnections: true,
  connectionLimit: 12,
  queueLimit: 0,
});

module.exports = pool.promise();
