import React, { useEffect, useState } from "react";
import "./AddToTable.css";

const AddToTable = ({ onClose, onSave }) => {
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null);
  const [error, setError] = useState("");

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
      .catch(() => setError("Failed to load table numbers."));
  }, []);

  // Handle the 'Add to Table' action
  const handleAddToTable = () => {
    if (!selectedTableNumber) {
      setError("Please select a table.");
      return;
    }
    onSave(selectedTableNumber);
  };

  return (
    <div className="add-to-table-popup-container">
      <div className="add-to-table-popup">
        {/* Header Section */}
        <div className="add-to-table-popup-header">
          <div className="add-to-table-header-container">
            <h2 className="add-to-table-title">Novi Stol</h2>{" "}
            {/* Updated class */}
          </div>
        </div>

        {/* Main Content Section */}
        <div className="add-to-table-popup-main">
          {error && <p className="add-to-table-error-message">{error}</p>}
          <label htmlFor="add-to-table-select" className="add-to-table-label">
            Unesi broj stola:
          </label>
          <select
            id="add-to-table-select"
            value={selectedTableNumber || ""}
            onChange={(e) => setSelectedTableNumber(e.target.value)}
            className="add-to-table-select"
          >
            <option value="" disabled>
              -- Select a Table --
            </option>
            {availableTables.map((table) => (
              <option key={table.table_id} value={table.table_number}>
                Table {table.table_number}
              </option>
            ))}
          </select>
        </div>

        {/* Footer Section */}
        <div className="add-to-table-popup-footer">
          <div className="add-to-table-footer-container">
            <div className="add-to-table-popup-buttons">
              <button
                onClick={handleAddToTable}
                className="add-to-table-popup-button green"
              >
                Save
              </button>
              <button
                onClick={onClose}
                className="add-to-table-popup-button red"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToTable;
