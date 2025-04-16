const express = require("express");
const { getCategories, getItemsByCategory } = require("./categoryController");
const receiptController = require("./receiptController");
const {
  createTable,
  getAvailableTables,
  addToTable,
} = require("./tableController"); // Import functions from tableController
const { getTablesWithItems } = require("./tableDisplayController"); // Import functions from tableDisplayController
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
app.get("/api/categories", getCategories); // Route to get categories
app.get("/api/items/:categoryId", getItemsByCategory); // Route to get items by category
app.post("/api/createTable", createTable); // Route to create a table
app.get("/api/getAvailableTables", getAvailableTables); // Route to get available tables
app.post("/api/addToTable", addToTable); // Route to add items to an existing table
app.get("/api/getTablesWithItems", getTablesWithItems); // Updated route to fetch tables and their items for display

// Start the server
app.listen(4500, () => console.log("Server running on port 4500"));
