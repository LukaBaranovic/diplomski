const db = require("./dbConfig");

const companyId = 1; // Hardcoded companyId

async function getTable(table_number) {
  const [rows] = await db.query(
    "SELECT * FROM tables WHERE table_number = ? AND company_id = ?",
    [table_number, companyId]
  );
  return rows[0];
}

const changeTable = async (req, res) => {
  const { old_table_number, new_table_number } = req.body;

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

    const oldTable = await getTable(old_table_number);
    const newTable = await getTable(new_table_number);

    if (!oldTable) {
      connection.release();
      return res.status(404).json({ message: "Izvorni stol ne postoji!" });
    }

    if (!newTable) {
      await connection.query(
        "UPDATE tables SET table_number = ? WHERE table_id = ? AND company_id = ?",
        [new_table_number, oldTable.table_id, companyId]
      );
      connection.release();
      return res
        .status(200)
        .json({ message: "Stol je preimenovan na novi broj." });
    }

    const [oldItems] = await connection.query(
      "SELECT * FROM table_cart_items WHERE table_id = ?",
      [oldTable.table_id]
    );
    const [newItems] = await connection.query(
      "SELECT * FROM table_cart_items WHERE table_id = ?",
      [newTable.table_id]
    );

    const newItemMap = {};
    newItems.forEach((item) => {
      newItemMap[item.item_id] = item;
    });

    for (const oldItem of oldItems) {
      if (newItemMap[oldItem.item_id]) {
        await connection.query(
          "UPDATE table_cart_items SET quantity = quantity + ? WHERE table_id = ? AND item_id = ?",
          [oldItem.quantity, newTable.table_id, oldItem.item_id]
        );
        await connection.query(
          "DELETE FROM table_cart_items WHERE table_cart_id = ?",
          [oldItem.table_cart_id]
        );
      } else {
        await connection.query(
          "UPDATE table_cart_items SET table_id = ? WHERE table_cart_id = ?",
          [newTable.table_id, oldItem.table_cart_id]
        );
      }
    }

    await connection.query(
      "DELETE FROM tables WHERE table_id = ? AND company_id = ?",
      [oldTable.table_id, companyId]
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
