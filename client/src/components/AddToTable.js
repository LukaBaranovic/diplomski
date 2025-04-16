import React, { useEffect, useState } from "react";
import "./AddToTable.css";

const AddToTable = ({ onClose, onSave }) => {
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
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
      .catch((err) => setError("Failed to load table numbers."));
  }, []);

  const handleAddToTable = () => {
    if (!selectedTable) {
      setError("Please select a table.");
      return;
    }
    onSave(selectedTable); // Pass the selected table to the parent
  };

  return (
    <div className="popup-container">
      <div className="popup">
        <h2>Add to Table</h2>
        {error && <p className="error-message">{error}</p>}
        <label htmlFor="table-select">Select a Table:</label>
        <select
          id="table-select"
          value={selectedTable || ""}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          <option value="" disabled>
            -- Select a Table --
          </option>
          {availableTables.map((table) => (
            <option key={table} value={table}>
              Table {table}
            </option>
          ))}
        </select>
        <div className="popup-buttons">
          <button onClick={handleAddToTable}>Add</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddToTable;
