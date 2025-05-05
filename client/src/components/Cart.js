import React from "react";
import "./Cart.css"; // Import the CSS file for styling

const Cart = ({ items, selectedItemId, setSelectedItemId }) => {
  const toggleItem = (itemId) => {
    setSelectedItemId(itemId === selectedItemId ? null : itemId);
  };

  return (
    <div className="cart-container">
      <table className="cart-table">
        <thead>
          <tr>
            <th>Artikal</th>
            <th>Količina</th>
            <th>Cijena</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                Nema artikala
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.item_id}
                onClick={() => toggleItem(item.item_id)}
                className={selectedItemId === item.item_id ? "selected" : ""}
              >
                <td>{item.item_name}</td>
                <td>{item.quantity}</td> {/* Display the quantity */}
                <td>€{item.item_price}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Cart;
