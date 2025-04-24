const db = require("./dbConfig"); // Import database configuration

/**
 * Controller to fetch table data and associated items by table_number.
 */
const getTableItemsByNumber = async (req, res) => {
  const { tableNumber } = req.params;

  const query = `
    SELECT c.item_name, c.quantity, c.item_price, (c.quantity * c.item_price) AS total_price
    FROM table_cart_items c
    LEFT JOIN tables t ON t.table_id = c.table_id
    WHERE t.table_number = ?
    ORDER BY c.item_name;
  `;

  try {
    // Execute the query with the provided tableNumber
    const [rows] = await db.execute(query, [tableNumber]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No items available for this table." });
    }

    res.status(200).json(rows); // Return the rows directly
  } catch (err) {
    console.error("Error fetching table items:", err.message);
    res.status(500).json({ error: "Failed to fetch table items." });
  }
};

module.exports = { getTableItemsByNumber };
