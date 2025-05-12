const db = require("./dbConfig");

const getReceiptDetails = async (req, res) => {
  const { receiptId } = req.query;

  if (!receiptId) {
    return res.status(400).json({ error: "Receipt ID is required." });
  }

  try {
    const [receiptRows] = await db.query(
      `SELECT r.table_number, r.timestamp, r.total_price
       FROM receipts r
       WHERE r.receipt_id = ?`,
      [receiptId]
    );

    if (receiptRows.length === 0) {
      return res.status(404).json({ error: "Receipt not found." });
    }

    const receipt = receiptRows[0];

    const [itemsRows] = await db.query(
      `SELECT item_name, quantity, total_price
       FROM receipt_items
       WHERE receipt_id = ?`,
      [receiptId]
    );

    res.status(200).json({
      table_number: receipt.table_number,
      timestamp: receipt.timestamp,
      total_price: receipt.total_price,
      items: itemsRows,
    });
  } catch (err) {
    console.error("Error fetching receipt details:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getReceiptDetails,
};
