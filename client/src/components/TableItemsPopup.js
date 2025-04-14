import React from "react";
import "./TableItemsPopup.css";

const TableItemsPopup = ({ table, onClose }) => {
  // Calculate total price
  const totalPrice = table.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Table {table.id} Items</h2>
        <table className="popup-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {table.items.map((item) => (
              <tr key={item.item_id}>
                <td>{item.item_name}</td>
                <td>{item.quantity}</td>
                <td>{item.price.toFixed(2)} $</td>
                <td>{(item.price * item.quantity).toFixed(2)} $</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="popup-total">
          <strong>Total Price: {totalPrice.toFixed(2)} $</strong>
        </div>
        <button className="popup-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default TableItemsPopup;
