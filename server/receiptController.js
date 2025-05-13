const db = require("./dbConfig"); // Ensure this path is correct

// Controller to handle saving receipts and receipt items
const saveReceipt = async (req, res) => {
  try {
    const { cartItems } = req.body; // Extract cart items from the request body

    // Validate cartItems
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "No items in the cart to save." });
    }

    let totalReceiptPrice = 0;

    // Fetch item details (name and price) using item_id, and calculate total price
    const receiptItemsData = await Promise.all(
      cartItems.map(async (cartItem) => {
        const [[item]] = await db.query(
          "SELECT item_name, item_price FROM item WHERE item_id = ?",
          [cartItem.item_id]
        );

        if (!item) {
          throw new Error(`Item with ID ${cartItem.item_id} not found.`);
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

    // Insert the receipt into the receipts table
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const [receiptResult] = await db.query(
      "INSERT INTO receipts (table_number, total_price, timestamp, company_id) VALUES (?, ?, ?, ?)",
      [0, totalReceiptPrice, timestamp, 1] // Set table_number to 0 by default
    );

    const receiptId = receiptResult.insertId;

    // Insert each receipt item into the receipt_items table
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
      .json({ message: "Receipt and items saved successfully.", receiptId });
  } catch (error) {
    console.error("Error saving receipt:", error.message);
    return res.status(500).json({
      error: "An error occurred while saving the receipt.",
      details: error.message,
    });
  }
};

module.exports = {
  saveReceipt,
};
