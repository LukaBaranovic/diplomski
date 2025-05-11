const express = require("express");
const router = express.Router();
const db = require("./dbConfig");

router.post("/save-receipt", async (req, res) => {
  const receiptItems = req.body;
  const waiter_id = 1;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const total_price = receiptItems.reduce(
      (sum, item) => sum + item.total_price,
      0
    );

    const [receiptResult] = await connection.query(
      "INSERT INTO receipts (total_price, waiter_id) VALUES (?, ?)",
      [total_price, waiter_id]
    );
    const receipt_id = receiptResult.insertId;

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
