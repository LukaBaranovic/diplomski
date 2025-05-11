const db = require("./dbConfig");

const getReceipts = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date is required." });
  }

  console.log("Date parameter received:", date);

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
    console.log("Receipts fetched:", receiptsRows);

    res.status(200).json({ receipts: receiptsRows });
  } catch (err) {
    console.error("Error fetching receipts:", err.message);
    res.status(500).json({ error: "Failed to fetch receipts." });
  }
};

module.exports = {
  getReceipts,
};
