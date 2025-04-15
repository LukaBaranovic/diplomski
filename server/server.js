const express = require("express");
const { getCategories, getItemsByCategory } = require("./categoryController");
const receiptController = require("./receiptController");
const { createTable } = require("./tableController"); // Import the tableController
const db = require("./dbConfig");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

// Check database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Failed to connect to the database:", err);
  } else {
    console.log("Successfully connected to the database");
    connection.release();
  }
});

// Define routes
app.get("/api/categories", getCategories);
app.get("/api/items/:categoryId", getItemsByCategory);
app.post("/api/createTable", createTable); // Link the createTable route

app.listen(4500, () => console.log("Server running on port 4500"));
