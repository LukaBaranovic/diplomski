const express = require("express");
const bodyParser = require("body-parser");
const db = require("./dbConfig"); // Import database configuration
const { getCategories, getItemsByCategory } = require("./categoryController");
const receiptController = require("./receiptController");
const {
  createTable,
  getAvailableTables,
  addToTable,
} = require("./tableController"); // Import the functions from tableController
const {
  getTableItemsByNumber,
  deleteTableItem,
} = require("./tablePopupController"); // Import tablePopupController functions
const { getTableData } = require("./tableDisplayController"); // Import the function from tableDisplayController

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
app.get("/api/getAvailableTables", getAvailableTables); // Add route for getting available tables
app.post("/api/addToTable", addToTable); // Add route for adding items to an existing table
app.get("/api/getTableData", getTableData); // Add route for fetching table data
app.get("/api/getTableItemsByNumber/:tableNumber", getTableItemsByNumber); // Add route for fetching items for a specific table
app.delete("/api/deleteTableItem", deleteTableItem); // Add route for deleting a specific item from a table

// Start the server
app.listen(4500, () => console.log("Server running on port 4500"));
