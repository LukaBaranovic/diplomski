import React from "react";
import "./TablePopup.css";

const TablePopup = ({ tableNumber, tableId, items, onClose }) => {
  // Calculate the total price for all items (ensuring numeric values)
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.total_price || 0),
    0
  );

  return (
    <div className="table-popup-overlay">
      <div className="table-popup-container">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h3>Table {tableNumber} Details</h3>
        <p>Table ID: {tableId}</p>
        <table className="table-popup-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.item_name}</td>
                <td>{item.quantity}</td>
                <td>{parseFloat(item.total_price || 0).toFixed(2)}€</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4>Total Price for Table: {totalPrice.toFixed(2)}€</h4>
      </div>
    </div>
  );
};

export default TablePopup;
