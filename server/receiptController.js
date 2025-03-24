const express = require("express");
const router = express.Router();
const db = require("./dbConfig");

// Endpoint to save the entire receipt
router.post("/save-receipt", async (req, res) => {
  const receiptItems = req.body;
  const waiter_id = 1; // Default waiter ID

  const connection = await db.getConnection(); // Get a connection from the pool
  try {
    await connection.beginTransaction();

    // Calculate total price
    const total_price = receiptItems.reduce(
      (sum, item) => sum + item.total_price,
      0
    );

    // Insert into receipts table
    const [receiptResult] = await connection.query(
      "INSERT INTO receipts (total_price, waiter_id) VALUES (?, ?)",
      [total_price, waiter_id]
    );
    const receipt_id = receiptResult.insertId;

    // Insert into receipt_items table
    const query = `
      INSERT INTO receipt_items (receipt_id, item_name, quantity, price)
      VALUES (?, ?, ?, ?)
    `;
    for (const item of receiptItems) {
      const values = [receipt_id, item.item_name, item.quantity, item.price];
      await connection.query(query, values);
    }

    await connection.commit();
    res.status(201).json({ message: "Receipt saved successfully", receipt_id });
  } catch (e) {
    await connection.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
