const db = require("./dbConfig");

async function getCategories(req, res) {
  try {
    const companyId = 1; // Hardcoded company ID
    const [rows] = await db.query(
      `SELECT category_id, category_name, type_id
       FROM category
       WHERE company_id = ?
       ORDER BY 
         CASE 
           WHEN type_id = 1 THEN 0
           WHEN type_id = 2 THEN 1
           ELSE 2
         END, category_id`,
      [companyId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getItemsByCategory(req, res) {
  const { categoryId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT item_id, item_name, item_price FROM item WHERE category_id = ?",
      [categoryId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getCategories,
  getItemsByCategory,
};
