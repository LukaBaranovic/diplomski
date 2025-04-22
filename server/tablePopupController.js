const db = require("./dbConfig");

const getTablePopupDetails = async (req, res) => {
  const { tableNumber } = req.params;

  try {
    const query = `
      SELECT item_id, item_name, quantity, price, (quantity * price) AS total_price
      FROM temporary_receipts
      WHERE table_id = ?
    `;
    const [rows] = await db.execute(query, [tableNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No items found for this table." });
    }

    const totalPrice = rows.reduce((sum, item) => sum + item.total_price, 0);

    res.json({ items: rows, totalPrice });
  } catch (error) {
    console.error("Error fetching table popup details:", error);
    res.status(500).json({ error: "Failed to fetch table popup details." });
  }
};

module.exports = { getTablePopupDetails };
