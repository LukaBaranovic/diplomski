const db = require("./dbConfig");

// Helper to get table by number and fixed company_id = 1
async function getTable(table_number) {
  const [rows] = await db.query(
    "SELECT * FROM tables WHERE table_number = ? AND company_id = 1",
    [table_number]
  );
  return rows[0];
}

const changeTable = async (req, res) => {
  console.log("Received request:", req.body);
  const { old_table_number, new_table_number } = req.body;
  const company_id = 1; // Always use 1, as per your instruction

  if (
    !old_table_number ||
    !new_table_number ||
    old_table_number === new_table_number
  ) {
    return res.status(400).json({ message: "Krivi podaci za prijenos stola." });
  }

  let connection;
  try {
    connection = await db.getConnection();

    // Get old and new table rows (for company_id = 1)
    const oldTable = await getTable(old_table_number);
    const newTable = await getTable(new_table_number);

    if (!oldTable) {
      connection.release();
      return res.status(404).json({ message: "Izvorni stol ne postoji!" });
    }

    if (!newTable) {
      // Target table doesn't exist: just rename
      await connection.query(
        "UPDATE tables SET table_number = ? WHERE table_id = ? AND company_id = 1",
        [new_table_number, oldTable.table_id]
      );
      connection.release();
      return res
        .status(200)
        .json({ message: "Stol je preimenovan na novi broj." });
    }

    // Target table exists: merge items and delete old table
    // Get all items for both tables
    const [oldItems] = await connection.query(
      "SELECT * FROM table_cart_items WHERE table_id = ?",
      [oldTable.table_id]
    );
    const [newItems] = await connection.query(
      "SELECT * FROM table_cart_items WHERE table_id = ?",
      [newTable.table_id]
    );

    // Map new table items for quick lookup
    const newItemMap = {};
    newItems.forEach((item) => {
      newItemMap[item.item_id] = item;
    });

    // Merge/move old items into new table
    for (const oldItem of oldItems) {
      if (newItemMap[oldItem.item_id]) {
        // If item exists, sum quantities
        await connection.query(
          "UPDATE table_cart_items SET quantity = quantity + ? WHERE table_id = ? AND item_id = ?",
          [oldItem.quantity, newTable.table_id, oldItem.item_id]
        );
        // Remove from old table
        await connection.query(
          "DELETE FROM table_cart_items WHERE table_cart_id = ?",
          [oldItem.table_cart_id]
        );
      } else {
        // Move item to new table
        await connection.query(
          "UPDATE table_cart_items SET table_id = ? WHERE table_cart_id = ?",
          [newTable.table_id, oldItem.table_cart_id]
        );
      }
    }

    // Delete old table after merge
    await connection.query(
      "DELETE FROM tables WHERE table_id = ? AND company_id = 1",
      [oldTable.table_id]
    );

    connection.release();
    return res
      .status(200)
      .json({ message: "Stol je uspješno prebačen i artikli su spojeni." });
  } catch (err) {
    if (connection) connection.release();
    console.error("Error in changeTable:", err);
    return res.status(500).json({ message: "Greška pri prijenosu stola!" });
  }
};

module.exports = { changeTable };
