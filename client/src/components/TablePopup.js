import React, { useEffect, useState } from "react";
import "./TablePopup.css";

const TablePopup = ({ tableNumber, onClose }) => {
  const [tableItems, setTableItems] = useState(null); // State to store table items
  const [error, setError] = useState(""); // State for error handling
  const [updatedQuantities, setUpdatedQuantities] = useState({}); // Track updated quantities

  // Fetch data for the selected table when the popup is opened
  useEffect(() => {
    fetch(`/api/getTableItemsByNumber/${tableNumber}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch table items.");
        }
        return res.json();
      })
      .then((data) => {
        setTableItems(data);
        // Initialize updatedQuantities state
        const initialQuantities = {};
        data.forEach((item) => {
          initialQuantities[item.item_name] = item.quantity;
        });
        setUpdatedQuantities(initialQuantities);
      })
      .catch(() => setError("Failed to load table items."));
  }, [tableNumber]);

  // Handle deleting an item
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
        setError(""); // Clear any previous errors
      })
      .catch(() => setError(`Failed to delete the item "${itemName}".`));
  };

  // Handle updating quantity locally (+/- buttons)
  const handleQuantityChange = (itemName, change) => {
    setUpdatedQuantities((prevState) => {
      const newQuantity = Math.max(1, prevState[itemName] + change); // Ensure minimum is 1
      return { ...prevState, [itemName]: newQuantity };
    });
  };

  // Handle confirming the quantity change
  const handleConfirmQuantity = (itemName) => {
    const newQuantity = updatedQuantities[itemName];

    // Send the updated quantity to the backend
    fetch(`/api/updateItemQuantity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_number: tableNumber,
        item_name: itemName,
        quantity: newQuantity,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update quantity.");
        }
        return res.json();
      })
      .then((updatedItems) => {
        setTableItems(updatedItems); // Update the table with the new list
        setError(""); // Clear any previous errors
      })
      .catch(() => setError(`Failed to update quantity for "${itemName}".`));
  };

  // Handle deleting the entire table
  const handleDeleteTable = () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this table? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    // Send a delete request to the backend
    fetch(`/api/deleteTable`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_number: tableNumber,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete the table.");
        }
        return res.json();
      })
      .then(() => {
        onClose(); // Close the popup after successful deletion
        setError(""); // Clear any previous errors
      })
      .catch(() => setError("Failed to delete the table."));
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
              <th>Action 1 (Delete)</th>
              <th>Action 2 (Quantity Control)</th>
            </tr>
          </thead>
          <tbody>
            {tableItems.map((item, index) => (
              <tr key={index}>
                <td>{item.item_name}</td>
                <td>
                  <div className="quantity-controller">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.item_name, -1)}
                    >
                      -
                    </button>
                    <span>{updatedQuantities[item.item_name]}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.item_name, 1)}
                    >
                      +
                    </button>
                    <button
                      className="confirm-btn"
                      onClick={() => handleConfirmQuantity(item.item_name)}
                    >
                      Confirm
                    </button>
                  </div>
                </td>
                <td>
                  $
                  {(
                    updatedQuantities[item.item_name] * item.item_price
                  ).toFixed(2)}
                </td>
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
        {/* Add Delete Table Button */}
        <button className="delete-table-button" onClick={handleDeleteTable}>
          Delete Table
        </button>
      </div>
    </div>
  );
};

export default TablePopup;
