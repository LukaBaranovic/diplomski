const db = require("./dbConfig");

const companyId = 1; // Hardcoded company_id

const getTableData = async (req, res) => {
  const query = `
    SELECT t.table_number, c.item_id, c.item_name, c.quantity
    FROM tables t
    LEFT JOIN table_cart_items c ON t.table_id = c.table_id
    WHERE t.company_id = ? -- Only fetch tables with the specified company_id
    ORDER BY t.table_number, c.item_name;
  `;

  try {
    const [rows] = await db.execute(query, [companyId]);

    const tableData = rows.reduce((acc, row) => {
      const existingTable = acc.find(
        (table) => table.table_number === row.table_number
      );

      if (existingTable) {
        existingTable.items.push({
          item_id: row.item_id,
          item_name: row.item_name,
          quantity: row.quantity,
        });
      } else {
        acc.push({
          table_number: row.table_number,
          items: row.item_id
            ? [
                {
                  item_id: row.item_id,
                  item_name: row.item_name,
                  quantity: row.quantity,
                },
              ]
            : [],
        });
      }

      return acc;
    }, []);

    res.status(200).json(tableData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri dohvaćanju podataka na stolu!" });
  }
};

module.exports = { getTableData };
