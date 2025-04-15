import React, { useState } from "react";
import "./CreateTable.css"; // Import CSS for styling

const CreateTable = ({ onClose, onSave }) => {
  const [tableNumber, setTableNumber] = useState(""); // State for the table number
  const [error, setError] = useState(""); // State for error messages

  const handleSave = () => {
    if (tableNumber) {
      onSave(tableNumber, setError); // Pass the table number and setError function to the parent
    } else {
      setError("Please enter a valid table number!"); // Show error if no table number is provided
    }
  };

  return (
    <div className="popup-container">
      <div className="popup">
        <h2>Create Table</h2>
        <label>
          Enter Table Number:
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Table Number"
          />
        </label>
        {error && <p className="error-message">{error}</p>}{" "}
        {/* Display error message */}
        <div className="popup-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateTable;
