const mysql = require("mysql2");

// Create a connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Add your MySQL password here
  database: "diplomatico", // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export a Promisified version of the pool
module.exports = pool.promise();
