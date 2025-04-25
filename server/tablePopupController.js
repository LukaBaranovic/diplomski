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

/**
 * Controller to delete a row from table_cart_items by table_number and item_name.
 */
const deleteTableItem = async (req, res) => {
  const { table_number, item_name } = req.body;

  if (!table_number || !item_name) {
    return res
      .status(400)
      .json({ error: "Missing table_number or item_name." });
  }

  const deleteQuery = `
    DELETE c
    FROM table_cart_items c
    LEFT JOIN tables t ON t.table_id = c.table_id
    WHERE t.table_number = ? AND c.item_name = ?;
  `;

  const fetchUpdatedItemsQuery = `
    SELECT c.item_name, c.quantity, c.item_price, (c.quantity * c.item_price) AS total_price
    FROM table_cart_items c
    LEFT JOIN tables t ON t.table_id = c.table_id
    WHERE t.table_number = ?
    ORDER BY c.item_name;
  `;

  try {
    // Perform the delete operation
    await db.execute(deleteQuery, [table_number, item_name]);

    // Fetch the updated list of items
    const [updatedItems] = await db.execute(fetchUpdatedItemsQuery, [
      table_number,
    ]);

    res.status(200).json(updatedItems); // Return the updated list
  } catch (err) {
    console.error("Error deleting item:", err.message);
    res.status(500).json({ error: "Failed to delete the item." });
  }
};

/**
 * Controller to update the quantity of an item in table_cart_items.
 */
const updateItemQuantity = async (req, res) => {
  const { table_number, item_name, quantity } = req.body;

  if (!table_number || !item_name || quantity < 1) {
    return res.status(400).json({ error: "Invalid input data." });
  }

  const updateQuery = `
    UPDATE table_cart_items c
    LEFT JOIN tables t ON t.table_id = c.table_id
    SET c.quantity = ?
    WHERE t.table_number = ? AND c.item_name = ?;
  `;

  const fetchUpdatedItemsQuery = `
    SELECT c.item_name, c.quantity, c.item_price, (c.quantity * c.item_price) AS total_price
    FROM table_cart_items c
    LEFT JOIN tables t ON t.table_id = c.table_id
    WHERE t.table_number = ?
    ORDER BY c.item_name;
  `;

  try {
    // Update the quantity in the database
    await db.execute(updateQuery, [quantity, table_number, item_name]);

    // Fetch the updated list of items
    const [updatedItems] = await db.execute(fetchUpdatedItemsQuery, [
      table_number,
    ]);

    res.status(200).json(updatedItems); // Return the updated list
  } catch (err) {
    console.error("Error updating quantity:", err.message);
    res.status(500).json({ error: "Failed to update quantity." });
  }
};

/**
 * Controller to delete the entire table and its items.
 */
const deleteTable = async (req, res) => {
  const { table_number } = req.body;

  if (!table_number) {
    return res.status(400).json({ error: "Missing table_number." });
  }

  const deleteItemsQuery = `
    DELETE FROM table_cart_items
    WHERE table_id = (SELECT table_id FROM tables WHERE table_number = ?);
  `;

  const deleteTableQuery = `
    DELETE FROM tables WHERE table_number = ?;
  `;

  try {
    // Start by deleting all table items
    await db.execute(deleteItemsQuery, [table_number]);

    // Then delete the table itself
    await db.execute(deleteTableQuery, [table_number]);

    res
      .status(200)
      .json({ message: "Table and its items deleted successfully." });
  } catch (err) {
    console.error("Error deleting table:", err.message);
    res.status(500).json({ error: "Failed to delete the table." });
  }
};

/**
 * Controller to handle "Cash" functionality.
 * Saves the table's data to receipts and receipt_items, then deletes the table.
 */
const cashTable = async (req, res) => {
  const { table_number } = req.body;

  if (!table_number) {
    return res.status(400).json({ error: "Table number is required." });
  }

  const fetchTableQuery = `
    SELECT * FROM table_cart_items 
    WHERE table_id = (SELECT table_id FROM tables WHERE table_number = ?);
  `;
  const fetchTotalPriceQuery = `
    SELECT SUM(quantity * item_price) AS total_price 
    FROM table_cart_items 
    WHERE table_id = (SELECT table_id FROM tables WHERE table_number = ?);
  `;
  const deleteTableItemsQuery = `
    DELETE FROM table_cart_items 
    WHERE table_id = (SELECT table_id FROM tables WHERE table_number = ?);
  `;
  const deleteTableQuery = `
    DELETE FROM tables WHERE table_number = ?;
  `;
  const insertReceiptQuery = `
    INSERT INTO receipts (table_number, total_price) VALUES (?, ?);
  `;
  const insertReceiptItemsQuery = `
    INSERT INTO receipt_items (receipt_id, item_name, quantity, total_price) 
    VALUES (?, ?, ?, ?);
  `;

  try {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    // Fetch table items and total price
    const [items] = await connection.query(fetchTableQuery, [table_number]);
    const [totalPriceResult] = await connection.query(fetchTotalPriceQuery, [
      table_number,
    ]);
    const total_price = totalPriceResult[0].total_price;

    // Insert receipt into receipts table
    const [receiptResult] = await connection.query(insertReceiptQuery, [
      table_number,
      total_price,
    ]);
    const receipt_id = receiptResult.insertId;

    // Insert items into receipt_items table
    for (const item of items) {
      await connection.query(insertReceiptItemsQuery, [
        receipt_id,
        item.item_name,
        item.quantity,
        item.item_price * item.quantity,
      ]);
    }

    // Delete table and its items
    await connection.query(deleteTableItemsQuery, [table_number]);
    await connection.query(deleteTableQuery, [table_number]);

    await connection.commit();
    connection.release();

    res.status(200).json({ message: "Table cashed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process cash operation." });
  }
};

module.exports = {
  getTableItemsByNumber,
  deleteTableItem,
  updateItemQuantity,
  deleteTable,
  cashTable, // Export the cashTable controller
};
