const db = require("./dbConfig");

// Utility to log grouped items by type, for new orders
function logOrderByType(items, itemTypeMap) {
  const typeGroups = {};
  for (const item of items) {
    const typeInfo = itemTypeMap[item.item_id];
    if (!typeInfo) continue;

    if (!typeGroups[typeInfo.type_name]) {
      typeGroups[typeInfo.type_name] = [];
    }
    typeGroups[typeInfo.type_name].push({
      item_name: item.item_name,
      quantity: item.quantity,
    });
  }

  console.log("Nova narudžba");
  console.log(""); // Blank line

  for (const [typeName, typeItems] of Object.entries(typeGroups)) {
    console.log(`Type: ${typeName}`);
    for (const item of typeItems) {
      console.log(`  - ${item.item_name} (qty: ${item.quantity})`);
    }
    console.log("");
  }
}

// Helper to fetch type info for all items in a single query
const getItemsTypeInfo = async (itemIds) => {
  if (!itemIds || itemIds.length === 0) return {};

  const placeholders = itemIds.map(() => "?").join(", ");
  const sql = `
    SELECT 
      i.item_id, 
      i.item_name, 
      c.category_id, 
      t.type_id, 
      t.type_name
    FROM item i
    INNER JOIN category c ON i.category_id = c.category_id
    INNER JOIN type t ON c.type_id = t.type_id
    WHERE i.item_id IN (${placeholders})
  `;

  const [rows] = await db.query(sql, itemIds);
  const itemTypeMap = {};
  for (const row of rows) {
    itemTypeMap[row.item_id] = {
      type_id: row.type_id,
      type_name: row.type_name,
      item_name: row.item_name,
    };
  }
  return itemTypeMap;
};

const companyId = 1; // Hardcoded company ID

const saveReceipt = async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Nema artikala u košarici!" });
    }

    // Fetch type info and log the order by type
    const itemIds = cartItems.map((cartItem) => cartItem.item_id);
    const itemTypeMap = await getItemsTypeInfo(itemIds);
    logOrderByType(cartItems, itemTypeMap);

    let totalReceiptPrice = 0;

    const receiptItemsData = await Promise.all(
      cartItems.map(async (cartItem) => {
        const [[item]] = await db.query(
          "SELECT item_name, item_price FROM item WHERE item_id = ?",
          [cartItem.item_id]
        );

        if (!item) {
          throw new Error(`Artikal ID ${cartItem.item_id} nije pronađen!"`);
        }

        const totalPrice = item.item_price * cartItem.quantity;
        totalReceiptPrice += totalPrice;

        return {
          item_id: cartItem.item_id,
          item_name: item.item_name,
          quantity: cartItem.quantity,
          total_price: totalPrice,
        };
      })
    );

    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const [receiptResult] = await db.query(
      "INSERT INTO receipts (table_number, total_price, timestamp, company_id) VALUES (?, ?, ?, ?)",
      [0, totalReceiptPrice, timestamp, companyId]
    );

    const receiptId = receiptResult.insertId;

    await Promise.all(
      receiptItemsData.map((receiptItem) =>
        db.query(
          "INSERT INTO receipt_items (receipt_id, item_name, quantity, total_price) VALUES (?, ?, ?, ?)",
          [
            receiptId,
            receiptItem.item_name,
            receiptItem.quantity,
            receiptItem.total_price,
          ]
        )
      )
    );

    return res
      .status(201)
      .json({ message: "Račun i artikli spremljeni uspješno!", receiptId });
  } catch (error) {
    console.error("Greška pri spremanju računa:", error.message);
    return res.status(500).json({
      error: "Greška pri spremanju računa!",
      details: error.message,
    });
  }
};

module.exports = {
  saveReceipt,
};
