const db = require("./dbConfig");

const companyId = 1; // Hardcoded company_id

const checkTableExists = async (tableNumber) => {
  const checkTableSql = `SELECT table_id FROM tables WHERE table_number = ? AND company_id = ?`;
  const [rows] = await db.execute(checkTableSql, [tableNumber, companyId]);
  return rows.length > 0 ? rows[0].table_id : null;
};

const createTable = async (req, res) => {
  const { tableNumber, items } = req.body;

  if (!tableNumber) {
    return res.status(400).json({ error: "Broj stola nevažeć!" });
  }

  try {
    const checkTableSql = `SELECT company_id FROM tables WHERE table_number = ?`;
    const [rows] = await db.execute(checkTableSql, [tableNumber]);

    for (const row of rows) {
      if (row.company_id === companyId) {
        return res.status(409).json({
          error: `Broj stola ${tableNumber} već postoji.`,
        });
      }
    }

    const insertTableSql = `INSERT INTO tables (table_number, company_id) VALUES (?, ?)`;
    const [tableResult] = await db.execute(insertTableSql, [
      tableNumber,
      companyId,
    ]);
    const tableId = tableResult.insertId;

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
      .json({ message: "Stol kreiran uspješno!", tableId, tableNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri kreiranju stola." });
  }
};

const getAvailableTables = async (req, res) => {
  const sql = `SELECT table_id, table_number FROM tables WHERE company_id = ?`;

  try {
    const [rows] = await db.execute(sql, [companyId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri dohvaćanju stolova!" });
  }
};

const addToTable = async (req, res) => {
  const { tableNumber, items } = req.body;

  if (!tableNumber || !items || items.length === 0) {
    return res
      .status(400)
      .json({ error: "Broj stola ili artikli nisu dohvaćeni!" });
  }

  try {
    // Check if the table exists for the current company_id
    const tableId = await checkTableExists(tableNumber);
    if (!tableId) {
      return res
        .status(404)
        .json({ error: `Broj stola ${tableNumber} ne postoji!` });
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
    res.status(200).json({ message: "Artikli dodani na stol uspješno!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri dodavanju artikala na stol!" });
  }
};

module.exports = { createTable, getAvailableTables, addToTable };
