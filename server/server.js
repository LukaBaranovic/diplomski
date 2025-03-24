const express = require("express");
const { getCategories, getItemsByCategory } = require("./categoryController"); // Import the category controller
const receiptController = require("./receiptController"); // Import the receipt controller
const db = require("./dbConfig"); // Import the database configuration
const bodyParser = require("body-parser"); // Import body-parser for handling JSON requests
const app = express();

app.use(bodyParser.json()); // Use body-parser middleware to parse JSON requests

// Check database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Failed to connect to the database:", err);
  } else {
    console.log("Successfully connected to the database");
    connection.release(); // Release the connection back to the pool
  }
});

app.get("/api/categories", getCategories);
app.get("/api/items/:categoryId", getItemsByCategory);
app.use("/api", receiptController); // Use the receipt controller

app.listen(4500, () => console.log("Server running on port 4500"));
