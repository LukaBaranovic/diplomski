const db = require("./dbConfig"); // Import database configuration

/**
 * Controller to fetch table data and associated items by table_number.
 */
const getTableItemsByNumber = async (req, res) => {
  const { tableNumber } = req.params;

  const query = `
    SELECT t.table_number, c.item_name, c.quantity, c.item_price
    FROM tables t
    LEFT JOIN table_cart_items c ON t.table_id = c.table_id
    WHERE t.table_number = ?
    ORDER BY c.item_name;
  `;

  try {
    // Execute the query with the provided tableNumber
    const [rows] = await db.execute(query, [tableNumber]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Table not found or no items associated." });
    }

    // Transform the data into the desired format
    const tableData = {
      table_number: rows[0].table_number,
      items: rows.map((row) => ({
        item_name: row.item_name,
        quantity: row.quantity,
        item_price: row.item_price,
      })),
    };

    res.status(200).json(tableData);
  } catch (err) {
    console.error("Error fetching table items:", err.message);
    res.status(500).json({ error: "Failed to fetch table items." });
  }
};

module.exports = { getTableItemsByNumber };
