import React, { useEffect, useState } from "react";
import "./TablePopup.css";

const TablePopup = ({ tableNumber, onClose }) => {
  const [tableItems, setTableItems] = useState(null); // State to store table items
  const [error, setError] = useState(""); // State for error handling

  // Fetch data for the selected table when the popup is opened
  useEffect(() => {
    fetch(`/api/getTableItemsByNumber/${tableNumber}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch table items.");
        }
        return res.json();
      })
      .then((data) => setTableItems(data))
      .catch(() => setError("Failed to load table items."));
  }, [tableNumber]);

  // Handler for deleting an item
  const handleDelete = (itemName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the item "${itemName}"?`
    );
    if (!confirmDelete) return;

    // Send a delete request to the backend
    fetch(`/api/deleteTableItem`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_number: tableNumber,
        item_name: itemName,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete the item.");
        }
        return res.json();
      })
      .then((updatedItems) => {
        setTableItems(updatedItems); // Update the table with the new list
      })
      .catch(() => setError("Failed to delete the item. Please try again."));
  };

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

  if (!tableItems) {
    return (
      <div className="popup-overlay">
        <div className="popup">
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
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
        <h2>Table {tableNumber}</h2>
        <table className="item-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableItems.map((item, index) => (
              <tr key={index}>
                <td>{item.item_name}</td>
                <td>{item.quantity}</td>
                <td>${Number(item.total_price).toFixed(2)}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(item.item_name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablePopup;
