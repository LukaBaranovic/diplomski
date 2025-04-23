const db = require("./dbConfig");

// Fetch all rows for a given table_number from table_cart
const getTablePopupDetails = async (req, res) => {
  const { tableNumber } = req.params; // tableNumber corresponds to table_number in table_cart

  try {
    // Query to fetch rows from table_cart for the given table_number
    const query = `
      SELECT item_name, quantity, item_price, (quantity * item_price) AS total_price
      FROM table_cart
      WHERE table_number = ?
    `;
    const [rows] = await db.execute(query, [tableNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No items found for this table." });
    }

    // Calculate the total price for the table
    const fullPrice = rows.reduce((sum, item) => sum + item.total_price, 0);

    res.json({ items: rows, fullPrice });
  } catch (error) {
    console.error("Error fetching table details:", error);
    res.status(500).json({ error: "Failed to fetch table details." });
  }
};

module.exports = { getTablePopupDetails };
