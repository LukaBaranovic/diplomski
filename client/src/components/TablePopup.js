import React from "react";
import "./TablePopup.css";

const TablePopup = ({ tableNumber, items, totalPrice, onClose }) => {
  return (
    <div className="table-popup-overlay">
      <div className="table-popup-container">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h3>Table {tableNumber} Details</h3>
        <table className="table-popup-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.item_name}</td>
                <td>{item.quantity}</td>
                <td>{item.total_price}€</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="total-price">
          <strong>Total:</strong> {totalPrice}€
        </div>
      </div>
    </div>
  );
};

export default TablePopup;
