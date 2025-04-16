const db = require("./dbConfig"); // Import the database configuration

/**
 * Controller to fetch all tables and their items from the database.
 * Groups items by table_number and returns their item names and quantities.
 */
const getTablesWithItems = async (req, res) => {
  const sql = `
    SELECT 
      table_number, 
      item_id, 
      item_name, 
      quantity 
    FROM 
      table_cart
    ORDER BY 
      table_number, item_name
  `;

  try {
    const [rows] = await db.execute(sql);
    console.log("Query Result:", rows); // Log the result for debugging

    // Group items by table_number
    const tables = rows.reduce((acc, row) => {
      const table = acc.find((t) => t.table_number === row.table_number);
      if (table) {
        table.items.push({
          item_id: row.item_id,
          item_name: row.item_name,
          quantity: row.quantity,
        });
      } else {
        acc.push({
          table_number: row.table_number,
          items: [
            {
              item_id: row.item_id,
              item_name: row.item_name,
              quantity: row.quantity,
            },
          ],
        });
      }
      return acc;
    }, []);

    res.status(200).json(tables);
  } catch (err) {
    console.error("Database Query Error:", err); // Log any database errors
    res.status(500).json({ error: "Failed to fetch tables and their items." });
  }
};

module.exports = { getTablesWithItems };
