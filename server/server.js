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

// Endpoint to add temporary receipts
app.post("/api/add-temporary-receipt", async (req, res) => {
  const { items } = req.body;
  try {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    const itemQueries = items.map((item) => {
      // Ensure all required fields are provided and not null
      if (
        !item.table_id ||
        !item.item_id ||
        !item.quantity ||
        item.price == null ||
        item.total_price == null ||
        !item.item_name
      ) {
        console.error("Missing required fields for temporary receipt", item);
        throw new Error("Missing required fields for temporary receipt");
      }
      return connection.query(
        `INSERT INTO temporary_receipts (table_id, item_id, item_name, quantity, price, total_price) VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        quantity = VALUES(quantity),
        total_price = VALUES(price) * VALUES(quantity)`,
        [
          item.table_id,
          item.item_id,
          item.item_name,
          item.quantity,
          parseFloat(item.price), // Ensure price is stored as a number
          item.price * item.quantity,
        ]
      );
    });
    await Promise.all(itemQueries);
    await connection.commit();
    connection.release();
    res.status(200).send({ message: "Temporary receipt added successfully" });
  } catch (error) {
    console.error("Error adding temporary receipt:", error);
    res.status(500).send({ error: "Error adding temporary receipt" });
  }
});

// Endpoint to get temporary receipts
app.get("/api/temporary-receipts", async (req, res) => {
  const { table_id } = req.query;
  try {
    const connection = await db.getConnection();
    let query = "SELECT * FROM temporary_receipts";
    const params = [];
    if (table_id) {
      query += " WHERE table_id = ?";
      params.push(table_id);
    }
    const [rows] = await connection.query(query, params);
    connection.release();
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error getting temporary receipts:", error);
    res.status(500).send({ error: "Error getting temporary receipts" });
  }
});

// Endpoint to delete temporary receipt by table_id
app.delete("/api/temporary-receipt/:table_id", async (req, res) => {
  const { table_id } = req.params;
  try {
    const connection = await db.getConnection();
    await connection.query(
      "DELETE FROM temporary_receipts WHERE table_id = ?",
      [table_id]
    );
    connection.release();
    res.status(200).send({ message: "Temporary receipt deleted successfully" });
  } catch (error) {
    console.error("Error deleting temporary receipt:", error);
    res.status(500).send({ error: "Error deleting temporary receipt" });
  }
});

// Endpoint to add receipts directly to the database
app.post("/api/add-receipt", async (req, res) => {
  const { items } = req.body;
  const total_price = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const waiter_id = 1; // Hardcoded waiter_id

  try {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    // Insert into receipts table
    const [result] = await connection.query(
      `INSERT INTO receipts (total_price, waiter_id, created_at) VALUES (?, ?, NOW())`,
      [total_price, waiter_id]
    );
    const receipt_id = result.insertId;

    // Insert into receipt_items table
    const receiptItemQueries = items.map((item) => {
      return connection.query(
        `INSERT INTO receipt_items (receipt_id, item_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)`,
        [
          receipt_id,
          item.item_id,
          item.item_name,
          item.quantity,
          parseFloat(item.price),
        ] // Ensure price is stored as a number
      );
    });
    await Promise.all(receiptItemQueries);

    await connection.commit();
    connection.release();
    res.status(200).send({ message: "Receipt added successfully" });
  } catch (error) {
    console.error("Error adding receipt:", error);
    res.status(500).send({ error: "Error adding receipt" });
  }
});

// New Endpoint to get existing tables
app.get("/api/get-existing-tables", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT DISTINCT table_id FROM temporary_receipts"
    );
    connection.release();
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error getting existing tables:", error);
    res.status(500).send({ error: "Error getting existing tables" });
  }
});

// New Endpoint to save items to an existing table
app.post("/api/save-to-existing-table", async (req, res) => {
  const { table_id, items } = req.body;
  try {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    for (const item of items) {
      // Ensure all required fields are provided and not null
      if (
        !item.item_id ||
        !item.quantity ||
        item.price == null ||
        !item.item_name
      ) {
        console.error("Missing required fields for temporary receipt", item);
        throw new Error("Missing required fields for temporary receipt");
      }

      const [existingItem] = await connection.query(
        "SELECT * FROM temporary_receipts WHERE table_id = ? AND item_id = ?",
        [table_id, item.item_id]
      );

      if (existingItem.length > 0) {
        await connection.query(
          `UPDATE temporary_receipts SET 
            quantity = quantity + ?,
            total_price = price * (quantity + ?)
          WHERE table_id = ? AND item_id = ?`,
          [item.quantity, item.quantity, table_id, item.item_id]
        );
      } else {
        await connection.query(
          `INSERT INTO temporary_receipts (table_id, item_id, item_name, quantity, price, total_price) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            table_id,
            item.item_id,
            item.item_name,
            item.quantity,
            parseFloat(item.price), // Ensure price is stored as a number
            item.price * item.quantity,
          ]
        );
      }
    }

    await connection.commit();
    connection.release();
    res.status(200).send({ message: "Items saved to table successfully" });
  } catch (error) {
    console.error("Error saving items to table:", error);
    res.status(500).send({ error: "Error saving items to table" });
  }
});

app.listen(4500, () => console.log("Server running on port 4500"));
