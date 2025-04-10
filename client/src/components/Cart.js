import React from "react";
import "./Cart.css";

const Cart = ({
  items,
  saveReceipt,
  selectedItemId,
  setSelectedItemId,
  saveReceiptButtonText,
}) => {
  const handleItemClick = (itemId) => {
    setSelectedItemId(itemId);
  };

  const isFromCategories = (item) => {
    return item.fromCategories;
  };

  return (
    <div className="cart-container">
      <h2>Cart</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.item_id}
              className={selectedItemId === item.item_id ? "selected" : ""}
              onClick={() => handleItemClick(item.item_id)}
            >
              <td>{item.item_name}</td>
              <td>{item.quantity}</td>
              <td>
                {isFromCategories(item)
                  ? item.price
                  : item.total_price / item.quantity}
              </td>{" "}
              {/* Display price based on source */}
              {console.log(
                `Item: ${item.item_name}, Price: ${
                  isFromCategories(item)
                    ? item.price
                    : item.total_price / item.quantity
                }`
              )}{" "}
              {/* Log price for debugging */}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={saveReceipt}>{saveReceiptButtonText}</button>
    </div>
  );
};

export default Cart;
