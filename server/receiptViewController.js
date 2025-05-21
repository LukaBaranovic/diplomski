const db = require("./dbConfig");

const companyId = 1; // Hardcoded company_id

const getReceipts = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Datum je potreban!" });
  }

  console.log("Date parameter received:", date);

  const receiptsQuery = `
    SELECT 
      r.receipt_id, 
      r.table_number, 
      r.timestamp,
      r.total_price
    FROM receipts r
    WHERE r.company_id = ? AND r.timestamp >= ? AND r.timestamp < DATE_ADD(?, INTERVAL 1 DAY);
  `;

  try {
    const [receiptsRows] = await db.query(receiptsQuery, [
      companyId,
      date,
      date,
    ]); // Include companyId in the query
    console.log("Računi dohvaćeni:", receiptsRows);

    res.status(200).json({ receipts: receiptsRows });
  } catch (err) {
    console.error("Greška pri dohvaćanju računa:", err.message);
    res.status(500).json({ error: "Greška pri dohvaćanju računa!" });
  }
};

// Controller to fetch the total lump sum of total_price for a specific day
const getDailyTotalPrice = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Datum je potreban!" });
  }

  console.log("Date parameter received for total price:", date);

  const totalPriceQuery = `
    SELECT 
      SUM(r.total_price) AS daily_total
    FROM receipts r
    WHERE r.company_id = ? AND r.timestamp >= ? AND r.timestamp < DATE_ADD(?, INTERVAL 1 DAY);
  `;

  try {
    const [[result]] = await db.query(totalPriceQuery, [companyId, date, date]); // Include companyId in the query

    console.log("Total price fetched for the day:", result);

    res.status(200).json({ dailyTotal: result.daily_total || 0 });
  } catch (err) {
    console.error("Greška pri dohvačanju totala:", err.message);
    res.status(500).json({ error: "Greška pri dohvaćanju totala!" });
  }
};

module.exports = {
  getReceipts,
  getDailyTotalPrice,
};
