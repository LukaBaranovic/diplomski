import React from "react";
import "./TableItemsPopup.css";

const TableItemsPopup = ({ table, onClose }) => {
  if (!table) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Table {table.id} Items</h2>
        <table className="table-items">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {table.items.map((item) => (
              <tr key={item.item_id}>
                <td>{item.item_name}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
                <td>{item.total_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default TableItemsPopup;
