import React from "react";
import "./Cart.css"; // Import the CSS file for styling

const Cart = ({ items, saveReceipt, selectedItemId, setSelectedItemId }) => {
  const toggleItem = (itemId) => {
    setSelectedItemId(itemId === selectedItemId ? null : itemId);
  };

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {items.length === 0 ? (
        <p>No items in the cart</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Amount</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.item_id}
                  onClick={() => toggleItem(item.item_id)}
                  className={selectedItemId === item.item_id ? "selected" : ""}
                >
                  <td>{item.item_name}</td>
                  <td>{item.quantity}</td> {/* Display the quantity */}
                  <td>€{item.item_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="save-receipt-button" onClick={saveReceipt}>
            Save Receipt
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
