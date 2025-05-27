const db = require("./dbConfig");

const companyId = 1; // Hardcoded company_id

const getReceipts = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Datum je potreban!" });
  }

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
    ]);

    res.status(200).json({ receipts: receiptsRows });
  } catch (err) {
    console.error("Greška pri dohvaćanju računa:", err.message);
    res.status(500).json({ error: "Greška pri dohvaćanju računa!" });
  }
};

const getDailyTotalPrice = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Datum je potreban!" });
  }

  const totalPriceQuery = `
    SELECT 
      SUM(r.total_price) AS daily_total
    FROM receipts r
    WHERE r.company_id = ? AND r.timestamp >= ? AND r.timestamp < DATE_ADD(?, INTERVAL 1 DAY);
  `;

  try {
    const [[result]] = await db.query(totalPriceQuery, [companyId, date, date]);

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
