const db = require("./dbConfig");

const transferTable = async (req, res) => {
  const { old_table_number, new_table_number } = req.body;
  if (
    !old_table_number ||
    !new_table_number ||
    old_table_number === new_table_number
  )
    return res.status(400).json({ message: "Krivi podaci za prijenos stola." });

  db.getConnection(async (err, connection) => {
    if (err) {
      return res.status(500).json({ message: "Greška s bazom podataka!" });
    }

    try {
      const [oldTables] = await connection
        .promise()
        .query("SELECT * FROM tables WHERE table_number = ?", [
          old_table_number,
        ]);
      if (!oldTables.length) {
        connection.release();
        return res.status(404).json({ message: "Izvorni stol ne postoji!" });
      }
      const oldTable = oldTables[0];

      const [newTables] = await connection
        .promise()
        .query("SELECT * FROM tables WHERE table_number = ?", [
          new_table_number,
        ]);
      if (!newTables.length) {
        await connection
          .promise()
          .query("UPDATE tables SET table_number = ? WHERE table_id = ?", [
            new_table_number,
            oldTable.table_id,
          ]);
        connection.release();
        return res
          .status(200)
          .json({ message: "Stol je prebačen na novi broj." });
      }

      const newTable = newTables[0];
      const [oldItems] = await connection
        .promise()
        .query("SELECT * FROM table_cart_items WHERE table_id = ?", [
          oldTable.table_id,
        ]);
      for (const item of oldItems) {
        const [existingRows] = await connection
          .promise()
          .query(
            "SELECT * FROM table_cart_items WHERE table_id = ? AND item_id = ?",
            [newTable.table_id, item.item_id]
          );
        if (existingRows.length) {
          await connection
            .promise()
            .query(
              "UPDATE table_cart_items SET quantity = quantity + ? WHERE table_id = ? AND item_id = ?",
              [item.quantity, newTable.table_id, item.item_id]
            );
          await connection
            .promise()
            .query(
              "DELETE FROM table_cart_items WHERE table_id = ? AND item_id = ?",
              [oldTable.table_id, item.item_id]
            );
        } else {
          await connection
            .promise()
            .query(
              "UPDATE table_cart_items SET table_id = ? WHERE table_id = ? AND item_id = ?",
              [newTable.table_id, oldTable.table_id, item.item_id]
            );
        }
      }
      await connection
        .promise()
        .query("DELETE FROM tables WHERE table_id = ?", [oldTable.table_id]);
      connection.release();
      return res
        .status(200)
        .json({ message: "Stol je uspješno prebačen i spojeni su artikli." });
    } catch (err) {
      console.error(err);
      if (connection) connection.release();
      return res.status(500).json({ message: "Greška pri prijenosu stola!" });
    }
  });
};

module.exports = { transferTable };
