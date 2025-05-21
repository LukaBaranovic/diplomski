const db = require("./dbConfig");

const companyId = 1; // Hardcoded company_id

const getTableItemsByNumber = async (req, res) => {
  const { tableNumber } = req.params;

  const query = `
    SELECT c.item_name, c.quantity, c.item_price, (c.quantity * c.item_price) AS total_price
    FROM table_cart_items c
    LEFT JOIN tables t ON t.table_id = c.table_id
    WHERE t.table_number = ? AND t.company_id = ?
    ORDER BY c.item_name;
  `;

  try {
    const [rows] = await db.execute(query, [tableNumber, companyId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Nema artikala na stolu!" });
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error("Greška pri dohvačanju artikala na stolu:", err.message);
    res.status(500).json({ error: "Greška pri dohvaćanju artikala na stolu!" });
  }
};

const deleteTableItem = async (req, res) => {
  const { table_number, item_name } = req.body;

  if (!table_number || !item_name) {
    return res
      .status(400)
      .json({ error: "Broj stola ili artikal ne postoji!" });
  }

  const deleteQuery = `
    DELETE c
    FROM table_cart_items c
    LEFT JOIN tables t ON t.table_id = c.table_id
    WHERE t.table_number = ? AND c.item_name = ? AND t.company_id = ?;
  `;

  const fetchUpdatedItemsQuery = `
    SELECT c.item_name, c.quantity, c.item_price, (c.quantity * c.item_price) AS total_price
    FROM table_cart_items c
    LEFT JOIN tables t ON t.table_id = c.table_id
    WHERE t.table_number = ? AND t.company_id = ?
    ORDER BY c.item_name;
  `;

  try {
    await db.execute(deleteQuery, [table_number, item_name, companyId]);

    const [updatedItems] = await db.execute(fetchUpdatedItemsQuery, [
      table_number,
      companyId,
    ]);

    res.status(200).json(updatedItems);
  } catch (err) {
    console.error("Greška pri brisanju artikla:", err.message);
    res.status(500).json({ error: "Greška pri brisanju artikla!" });
  }
};

const updateItemQuantity = async (req, res) => {
  const { table_number, item_name, quantity } = req.body;

  if (!table_number || !item_name || quantity < 1) {
    return res.status(400).json({ error: "Nevažeć unos!" });
  }

  const updateQuery = `
    UPDATE table_cart_items c
    LEFT JOIN tables t ON t.table_id = c.table_id
    SET c.quantity = ?
    WHERE t.table_number = ? AND c.item_name = ? AND t.company_id = ?;
  `;

  const fetchUpdatedItemsQuery = `
    SELECT c.item_name, c.quantity, c.item_price, (c.quantity * c.item_price) AS total_price
    FROM table_cart_items c
    LEFT JOIN tables t ON t.table_id = c.table_id
    WHERE t.table_number = ? AND t.company_id = ?
    ORDER BY c.item_name;
  `;

  try {
    await db.execute(updateQuery, [
      quantity,
      table_number,
      item_name,
      companyId,
    ]);

    const [updatedItems] = await db.execute(fetchUpdatedItemsQuery, [
      table_number,
      companyId,
    ]);

    res.status(200).json(updatedItems);
  } catch (err) {
    console.error("Greška pri ažuriranju stola:", err.message);
    res.status(500).json({ error: "Greška pri ažuriranju stola!" });
  }
};

const deleteTable = async (req, res) => {
  const { table_number } = req.body;

  if (!table_number) {
    return res.status(400).json({ error: "Broj stola ne postoji!" });
  }

  const deleteItemsQuery = `
    DELETE FROM table_cart_items
    WHERE table_id = (SELECT table_id FROM tables WHERE table_number = ? AND company_id = ?);
  `;

  const deleteTableQuery = `
    DELETE FROM tables WHERE table_number = ? AND company_id = ?;
  `;

  try {
    await db.execute(deleteItemsQuery, [table_number, companyId]);
    await db.execute(deleteTableQuery, [table_number, companyId]);

    res.status(200).json({ message: "Stol i artikli uspješno obrisani!" });
  } catch (err) {
    console.error("Greška pri brisanju stola:", err.message);
    res.status(500).json({ error: "Greška pri brisanju stola!" });
  }
};

const cashTable = async (req, res) => {
  const { table_number } = req.body;

  if (!table_number) {
    return res.status(400).json({ error: "Broj stola je potreban!" });
  }

  const fetchTableQuery = `
    SELECT * FROM table_cart_items 
    WHERE table_id = (SELECT table_id FROM tables WHERE table_number = ? AND company_id = ?);
  `;
  const fetchTotalPriceQuery = `
    SELECT SUM(quantity * item_price) AS total_price 
    FROM table_cart_items 
    WHERE table_id = (SELECT table_id FROM tables WHERE table_number = ? AND company_id = ?);
  `;
  const deleteTableItemsQuery = `
    DELETE FROM table_cart_items 
    WHERE table_id = (SELECT table_id FROM tables WHERE table_number = ? AND company_id = ?);
  `;
  const deleteTableQuery = `
    DELETE FROM tables WHERE table_number = ? AND company_id = ?;
  `;
  const insertReceiptQuery = `
    INSERT INTO receipts (table_number, total_price, company_id) VALUES (?, ?, ?);
  `;
  const insertReceiptItemsQuery = `
    INSERT INTO receipt_items (receipt_id, item_name, quantity, total_price) 
    VALUES (?, ?, ?, ?);
  `;

  try {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    const [items] = await connection.query(fetchTableQuery, [
      table_number,
      companyId,
    ]);
    const [totalPriceResult] = await connection.query(fetchTotalPriceQuery, [
      table_number,
      companyId,
    ]);
    const total_price = totalPriceResult[0].total_price;

    const [receiptResult] = await connection.query(insertReceiptQuery, [
      table_number,
      total_price,
      companyId,
    ]);
    const receipt_id = receiptResult.insertId;

    for (const item of items) {
      await connection.query(insertReceiptItemsQuery, [
        receipt_id,
        item.item_name,
        item.quantity,
        item.item_price * item.quantity,
      ]);
    }

    await connection.query(deleteTableItemsQuery, [table_number, companyId]);
    await connection.query(deleteTableQuery, [table_number, companyId]);

    await connection.commit();
    connection.release();

    res.status(200).json({ message: "Stol finaliziran uspješno." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri finaliziranju stola." });
  }
};

module.exports = {
  getTableItemsByNumber,
  deleteTableItem,
  updateItemQuantity,
  deleteTable,
  cashTable,
};
