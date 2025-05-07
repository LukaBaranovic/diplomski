import React, { useEffect, useState } from "react";
import "./AddToTable.css";
import "./PopupStyle.css"; // Adjust the path based on your folder structure

const AddToTable = ({ onClose, onSave }) => {
  const [availableTables, setAvailableTables] = useState([]); // Fetch available tables
  const [selectedTableNumber, setSelectedTableNumber] = useState(null); // Track selected table
  const [errorMessage, setErrorMessage] = useState(""); // Handle errors

  // Fetch table data when component loads
  useEffect(() => {
    fetch("/api/getAvailableTables")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch tables.");
        }
        return res.json();
      })
      .then((data) => setAvailableTables(data)) // Expecting an array of { table_id, table_number }
      .catch(() => setErrorMessage("Nije moguće učitati stolove."));
  }, []);

  const handleTableClick = (tableNumber) => {
    setSelectedTableNumber(tableNumber); // Set selected table
    setErrorMessage(""); // Clear error message
  };

  const handleSave = () => {
    if (!selectedTableNumber) {
      setErrorMessage("Molimo odaberite stol."); // Display error if no table selected
      return;
    }
    onSave(selectedTableNumber); // Pass selected table to parent
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content add-to-table-popup">
        {/* Header Section */}
        <div className="popup-header">
          <div className="header-container">
            <h2>Dodaj na Stol</h2>
          </div>
          <hr className="smooth-line" />
        </div>

        {/* Main Content Section */}
        <div className="popup-main">
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="table-list">
            {availableTables.map((table) => (
              <div
                key={table.table_id}
                className={`table-item ${
                  selectedTableNumber === table.table_number ? "selected" : ""
                }`}
                onClick={() => handleTableClick(table.table_number)}
              >
                Stol {table.table_number}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="popup-footer">
          <hr className="smooth-line" />
          <div className="footer-container">
            <button className="popup-button green" onClick={handleSave}>
              Spremi
            </button>
            <button className="popup-button red" onClick={onClose}>
              Otkaži
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToTable;
