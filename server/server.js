const express = require("express");
const bodyParser = require("body-parser");
const db = require("./dbConfig");
const { getCategories, getItemsByCategory } = require("./categoryController");
const {
  createTable,
  getAvailableTables,
  addToTable,
} = require("./tableController");
const {
  getTableItemsByNumber,
  deleteTableItem,
  updateItemQuantity,
  deleteTable,
  cashTable,
} = require("./tablePopupController");
const { getTableData } = require("./tableDisplayController");
const { getReceipts, getDailyTotalPrice } = require("./receiptViewController");
const { getReceiptDetails } = require("./receiptDetailsViewController");
const { saveReceipt } = require("./receiptController");

// USE DESTRUCTURING HERE:
const { changeTable } = require("./changeTableController");

const app = express();

app.use(bodyParser.json());

db.getConnection((err, connection) => {
  if (err) {
    console.error("Failed to connect to the database:", err);
  } else {
    console.log("Successfully connected to the database");
    connection.release();
  }
});

app.get("/api/categories", getCategories);
app.get("/api/items/:categoryId", getItemsByCategory);
app.post("/api/createTable", createTable);
app.get("/api/getAvailableTables", getAvailableTables);
app.post("/api/addToTable", addToTable);
app.get("/api/getTableData", getTableData);
app.get("/api/getTableItemsByNumber/:tableNumber", getTableItemsByNumber);
app.delete("/api/deleteTableItem", deleteTableItem);
app.post("/api/updateItemQuantity", updateItemQuantity);
app.delete("/api/deleteTable", deleteTable);
app.post("/api/cashTable", cashTable);
app.get("/api/getReceipts", getReceipts);
app.get("/api/getReceiptDetails", getReceiptDetails);

app.post("/api/saveReceipt", saveReceipt);
app.get("/api/getDailyTotalPrice", getDailyTotalPrice);

// USE NAMED FUNCTION
app.post("/api/changeTable", changeTable);

app.listen(4500, () => console.log("Server running on port 4500"));
