import React, { useEffect, useState } from "react";
import "./AddToTable.css";

const AddToTable = ({ onClose, onSave }) => {
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch available tables when the component loads
  useEffect(() => {
    fetch("/api/getAvailableTables")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch tables.");
        }
        return res.json();
      })
      .then((data) => setAvailableTables(data))
      .catch((err) => setErrorMessage("Nije moguće učitati stolove.")); // Updated message
  }, []);

  // Handle the 'Add to Table' action
  const handleAddToTable = () => {
    if (!selectedTableNumber) {
      setErrorMessage("Molimo odaberite stol."); // Updated message
      return;
    }
    onSave(selectedTableNumber); // Pass the selected `table_number` to the parent
  };

  return (
    <div className="add-to-table-popup">
      <div className="add-to-table-popup-content">
        {/* Header Section */}
        <div className="popup-header">
          <div className="header-container">
            <h3>Dodaj na stol</h3> {/* Updated header text */}
          </div>
          <hr className="smooth-line" />
        </div>

        {/* Main Content Section */}
        <div className="popup-main">
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <label htmlFor="table-select" className="input-label">
            Odaberite stol:
          </label>
          <select
            id="table-select"
            value={selectedTableNumber || ""}
            onChange={(e) => setSelectedTableNumber(e.target.value)}
            className="table-select"
          >
            <option value="" disabled>
              -- Odaberite stol --
            </option>
            {availableTables.map((table) => (
              <option key={table.table_id} value={table.table_number}>
                Stol {table.table_number}
              </option>
            ))}
          </select>
        </div>

        {/* Footer Section */}
        <div className="popup-footer">
          <hr className="smooth-line" />
          <div className="footer-container">
            <div className="popup-buttons">
              <button className="popup-button green" onClick={handleAddToTable}>
                Dodaj {/* Updated Add button */}
              </button>
              <button className="popup-button red" onClick={onClose}>
                Otkaži {/* Updated Cancel button */}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToTable;
