const db = require("./dbConfig"); // Import the database configuration

// Helper function to check if a table exists in the database
const checkTableExists = async (tableNumber) => {
  const checkTableSql = `SELECT COUNT(*) AS count FROM table_cart WHERE table_number = ?`;
  const [rows] = await db.execute(checkTableSql, [tableNumber]);
  return rows[0].count > 0; // Returns true if table exists
};

/**
 * Controller to handle creating a table and inserting cart items into the database.
 * Checks if the table exists before inserting items.
 */
const createTable = async (req, res) => {
  const { tableNumber, items } = req.body;

  // Validate the input
  if (!tableNumber || !items || items.length === 0) {
    return res
      .status(400)
      .json({ error: "Table number or items are missing or invalid." });
  }

  try {
    const tableExists = await checkTableExists(tableNumber);
    if (tableExists) {
      return res
        .status(409)
        .json({ error: `Table ${tableNumber} is already taken.` });
    }

    // Insert items into the table_cart
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
    res.status(200).json({ message: "Table created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create table" });
  }
};

/**
 * Controller to fetch all available (open) tables.
 */
const getAvailableTables = async (req, res) => {
  const sql = `SELECT DISTINCT table_number FROM table_cart`;

  try {
    const [rows] = await db.execute(sql); // Fetch distinct table numbers
    res.status(200).json(rows.map((row) => row.table_number)); // Send table numbers as an array
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Unable to fetch available tables at this time." });
  }
};

/**
 * Controller to handle adding items to an existing table.
 * Merges quantities if the item already exists in the table.
 */
const addToTable = async (req, res) => {
  const { tableNumber, items } = req.body;

  // Validate the input
  if (!tableNumber || !items || items.length === 0) {
    return res
      .status(400)
      .json({ error: "Table number or items are missing or invalid." });
  }

  try {
    const tableExists = await checkTableExists(tableNumber);
    if (!tableExists) {
      return res
        .status(404)
        .json({ error: `Table ${tableNumber} does not exist.` });
    }

    // Merge or insert each item into the table
    const mergeOrInsertPromises = items.map(async (item) => {
      const checkItemSql = `
        SELECT quantity FROM table_cart
        WHERE table_number = ? AND item_id = ?
      `;
      const [itemRows] = await db.execute(checkItemSql, [
        tableNumber,
        item.item_id,
      ]);

      if (itemRows.length > 0) {
        const newQuantity = itemRows[0].quantity + item.quantity;
        const updateItemSql = `
          UPDATE table_cart
          SET quantity = ?
          WHERE table_number = ? AND item_id = ?
        `;
        return db.execute(updateItemSql, [
          newQuantity,
          tableNumber,
          item.item_id,
        ]);
      } else {
        const insertItemSql = `
          INSERT INTO table_cart (table_number, item_id, item_name, quantity, item_price)
          VALUES (?, ?, ?, ?, ?)
        `;
        return db.execute(insertItemSql, [
          tableNumber,
          item.item_id,
          item.item_name,
          item.quantity,
          item.item_price,
        ]);
      }
    });

    await Promise.all(mergeOrInsertPromises);
    res.status(200).json({ message: "Items added to table successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add items to the table." });
  }
};

module.exports = { createTable, getAvailableTables, addToTable };
