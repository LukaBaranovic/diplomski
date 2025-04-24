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

module.exports = { getTableItemsByNumber, deleteTableItem, updateItemQuantity };
