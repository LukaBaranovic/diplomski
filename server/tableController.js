const db = require("./dbConfig");

const companyId = 1; // Hardcoded company_id

// Function to check if the table_number exists for the current company_id
const checkTableExists = async (tableNumber) => {
  const checkTableSql = `SELECT table_id FROM tables WHERE table_number = ? AND company_id = ?`;
  const [rows] = await db.execute(checkTableSql, [tableNumber, companyId]);
  return rows.length > 0 ? rows[0].table_id : null;
};

const createTable = async (req, res) => {
  const { tableNumber, items } = req.body;

  if (!tableNumber) {
    return res
      .status(400)
      .json({ error: "Table number is missing or invalid." });
  }

  try {
    // Query the database to check for existing tables with the same table_number
    const checkTableSql = `SELECT company_id FROM tables WHERE table_number = ?`;
    const [rows] = await db.execute(checkTableSql, [tableNumber]);

    // Loop through the results to check for the same company_id
    for (const row of rows) {
      if (row.company_id === companyId) {
        return res.status(409).json({
          error: `Table number ${tableNumber} already exists for the current company.`,
        });
      }
    }

    // If no duplicate found for the current company_id, insert the new table
    const insertTableSql = `INSERT INTO tables (table_number, company_id) VALUES (?, ?)`;
    const [tableResult] = await db.execute(insertTableSql, [
      tableNumber,
      companyId,
    ]);
    const tableId = tableResult.insertId;

    // Insert items if provided
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

const getAvailableTables = async (req, res) => {
  const sql = `SELECT table_id, table_number FROM tables WHERE company_id = ?`;

  try {
    const [rows] = await db.execute(sql, [companyId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch available tables." });
  }
};

const addToTable = async (req, res) => {
  const { tableNumber, items } = req.body;

  if (!tableNumber || !items || items.length === 0) {
    return res
      .status(400)
      .json({ error: "Table number or items are missing or invalid." });
  }

  try {
    // Check if the table exists for the current company_id
    const tableId = await checkTableExists(tableNumber);
    if (!tableId) {
      return res
        .status(404)
        .json({ error: `Table number ${tableNumber} does not exist.` });
    }

    // Insert or update items in the table_cart_items table
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
