const db = require("./dbConfig");

// Fetch only the table_id for the popup
const getTablePopupDetails = async (req, res) => {
  const { tableNumber } = req.params;

  try {
    const query = `
      SELECT table_id
      FROM temporary_receipts
      WHERE table_id = ? LIMIT 1
    `;
    const [rows] = await db.execute(query, [tableNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Table not found." });
    }

    res.json({ table_id: rows[0].table_id });
  } catch (error) {
    console.error("Error fetching table ID:", error);
    res.status(500).json({ error: "Failed to fetch table ID." });
  }
};

module.exports = { getTablePopupDetails };
