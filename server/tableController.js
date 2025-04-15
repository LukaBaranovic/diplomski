const db = require("./dbConfig"); // Import the database configuration

/**
 * Controller to handle creating a table and inserting cart items into the database.
 * Checks if the table exists before inserting items.
 */
const createTable = async (req, res) => {
  const { tableNumber, items } = req.body;

  // Validate the input
  if (!tableNumber || !items || items.length === 0) {
    return res.status(400).json({ error: "Invalid table number or items" });
  }

  try {
    // Check if the table number already exists in the database
    const checkTableSql = `SELECT COUNT(*) AS count FROM table_cart WHERE table_number = ?`;
    const [rows] = await db.execute(checkTableSql, [tableNumber]);

    const tableExists = rows[0].count > 0;

    if (tableExists) {
      // If the table already exists, return a warning and exit
      return res
        .status(409)
        .json({ error: `Table ${tableNumber} is already taken.` });
    }

    // If table doesn't exist, insert the items into the table_cart
    const insertSql = `
      INSERT INTO table_cart (table_number, item_id, item_name, quantity, item_price)
      VALUES (?, ?, ?, ?, ?)
    `;

    const promises = items.map((item) =>
      db.execute(insertSql, [
        tableNumber,
        item.item_id,
        item.item_name,
        item.quantity,
        item.item_price,
      ])
    );

    await Promise.all(promises);

    // After inserting all items, send a success response
    res.status(200).json({ message: "Table created successfully" });
  } catch (err) {
    // Handle any database errors
    console.error(err);
    res.status(500).json({ error: "Failed to create table" });
  }
};

module.exports = { createTable };
