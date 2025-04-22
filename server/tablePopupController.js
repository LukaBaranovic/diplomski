const db = require("./dbConfig");

// Fetch all rows for a given table_id
const getTablePopupDetails = async (req, res) => {
  const { tableNumber } = req.params; // tableNumber is the table_id

  try {
    // Query to fetch all rows for the given table_id
    const query = `
      SELECT item_name, quantity, price, total_price
      FROM temporary_receipts
      WHERE table_id = ?
    `;
    const [rows] = await db.execute(query, [tableNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No items found for this table." });
    }

    // Calculate the full price (sum of total_price for all rows)
    const fullPrice = rows.reduce((sum, item) => sum + item.total_price, 0);

    res.json({ items: rows, fullPrice });
  } catch (error) {
    console.error("Error fetching table details:", error);
    res.status(500).json({ error: "Failed to fetch table details." });
  }
};

module.exports = { getTablePopupDetails };
