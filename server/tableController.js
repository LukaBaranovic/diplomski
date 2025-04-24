const db = require("./dbConfig"); // Import the database configuration

/**
 * Helper function to check if a table exists in the database.
 * Returns the `table_id` if the table exists, otherwise null.
 */
const checkTableExists = async (tableNumber) => {
  const checkTableSql = `SELECT table_id FROM tables WHERE table_number = ?`;
  const [rows] = await db.execute(checkTableSql, [tableNumber]);
  return rows.length > 0 ? rows[0].table_id : null;
};

/**
 * Controller to handle creating a table and optionally associating items with it in the database.
 * Creates a new table in the `tables` table and associates items with it in `table_cart_items`.
 */
const createTable = async (req, res) => {
  const { tableNumber, items } = req.body;

  // Validate the input
  if (!tableNumber) {
    return res
      .status(400)
      .json({ error: "Table number is missing or invalid." });
  }

  try {
    // Check if the table already exists
    const tableExists = await checkTableExists(tableNumber);
    if (tableExists) {
      return res
        .status(409)
        .json({ error: `Table number ${tableNumber} is already taken.` });
    }

    // Insert the new table into the `tables` table
    const insertTableSql = `INSERT INTO tables (table_number) VALUES (?)`;
    const [tableResult] = await db.execute(insertTableSql, [tableNumber]);
    const tableId = tableResult.insertId; // Get the newly inserted table_id

    // If items are provided, insert them into the `table_cart_items` table
    if (items && items.length > 0) {
      const insertItemSql = `
        INSERT INTO table_cart_items (table_id, item_id, item_name, quantity, item_price)
        VALUES (?, ?, ?, ?, ?)
      `;

      const promises = items.map((item) =>
        db.execute(insertItemSql, [
          tableId,
          item.item_id,
          item.item_name,
          item.quantity,
          item.item_price,
        ])
      );

      await Promise.all(promises);
    }

    res
      .status(201)
      .json({ message: "Table created successfully", tableId, tableNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create table." });
  }
};

/**
 * Controller to fetch all available tables.
 * Returns a list of tables with their `table_id` and `table_number`.
 */
const getAvailableTables = async (req, res) => {
  const sql = `SELECT table_id, table_number FROM tables`;

  try {
    const [rows] = await db.execute(sql);
    res.status(200).json(rows); // Send table_id and table_number as an array of objects
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch available tables." });
  }
};

/**
 * Controller to handle adding items to an existing table.
 * Merges quantities if the item already exists in the table, or inserts new items.
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
    // Get the `table_id` for the given `tableNumber`
    const tableId = await checkTableExists(tableNumber);

    if (!tableId) {
      return res
        .status(404)
        .json({ error: `Table number ${tableNumber} does not exist.` });
    }

    // Merge or insert each item into the `table_cart_items` table
    const mergeOrInsertPromises = items.map(async (item) => {
      const checkItemSql = `
        SELECT quantity FROM table_cart_items
        WHERE table_id = ? AND item_id = ?
      `;
      const [itemRows] = await db.execute(checkItemSql, [
        tableId,
        item.item_id,
      ]);

      if (itemRows.length > 0) {
        const newQuantity = itemRows[0].quantity + item.quantity;
        const updateItemSql = `
          UPDATE table_cart_items
          SET quantity = ?
          WHERE table_id = ? AND item_id = ?
        `;
        return db.execute(updateItemSql, [newQuantity, tableId, item.item_id]);
      } else {
        const insertItemSql = `
          INSERT INTO table_cart_items (table_id, item_id, item_name, quantity, item_price)
          VALUES (?, ?, ?, ?, ?)
        `;
        return db.execute(insertItemSql, [
          tableId,
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
