const db = require("./dbConfig");

/**
 * Controller to fetch receipts for a specific date.
 */
const getReceipts = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date is required." });
  }

  console.log("Date parameter received:", date); // Debug log

  // Query to fetch receipts for the specific date, including table number and total price
  const receiptsQuery = `
    SELECT 
      r.receipt_id, 
      r.table_number, 
      r.timestamp,
      r.total_price
    FROM receipts r
    WHERE r.timestamp >= ? AND r.timestamp < DATE_ADD(?, INTERVAL 1 DAY);
  `;

  try {
    const [receiptsRows] = await db.query(receiptsQuery, [date, date]);
    console.log("Receipts fetched:", receiptsRows); // Debug log

    res.status(200).json({ receipts: receiptsRows });
  } catch (err) {
    console.error("Error fetching receipts:", err.message); // Debug log
    res.status(500).json({ error: "Failed to fetch receipts." });
  }
};

module.exports = {
  getReceipts,
};
