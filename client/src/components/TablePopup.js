import React, { useEffect, useState } from "react";
import "./TablePopup.css"; // Import CSS for styling the popup

const TablePopup = ({ tableNumber, onClose }) => {
  const [tableData, setTableData] = useState(null); // State to store table data
  const [error, setError] = useState(""); // State for error handling

  // Fetch data for the selected table
  useEffect(() => {
    fetch(`/api/getTableItemsByNumber/${tableNumber}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch table items.");
        }
        return res.json();
      })
      .then((data) => setTableData(data))
      .catch((err) => setError("Failed to load table items."));
  }, [tableNumber]);

  if (error) {
    return (
      <div className="popup-overlay">
        <div className="popup">
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="popup-overlay">
        <div className="popup">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Table Number: {tableData.table_number}</h2>
        <table className="item-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {tableData.items.map((item, index) => (
              <tr key={index}>
                <td>{item.item_name}</td>
                <td>{item.quantity}</td>
                <td>${(item.quantity * item.item_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablePopup;
