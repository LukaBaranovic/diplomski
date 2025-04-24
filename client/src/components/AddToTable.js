import React, { useEffect, useState } from "react";
import "./AddToTable.css";

const AddToTable = ({ onClose, onSave }) => {
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null); // Use table_number instead of table_id
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
      .then((data) => setAvailableTables(data)) // Expecting an array of { table_id, table_number }
      .catch((err) => setError("Failed to load table numbers."));
  }, []);

  // Handle the 'Add to Table' action
  const handleAddToTable = () => {
    if (!selectedTableNumber) {
      setError("Please select a table.");
      return;
    }
    onSave(selectedTableNumber); // Pass the selected `table_number` to the parent
  };

  return (
    <div className="popup-container">
      <div className="popup">
        <h2>Add to Table</h2>
        {error && <p className="error-message">{error}</p>}
        <label htmlFor="table-select">Select a Table:</label>
        <select
          id="table-select"
          value={selectedTableNumber || ""}
          onChange={(e) => setSelectedTableNumber(e.target.value)}
        >
          <option value="" disabled>
            -- Select a Table --
          </option>
          {availableTables.map((table) => (
            <option key={table.table_id} value={table.table_number}>
              {" "}
              {/* Send table_number */}
              Table {table.table_number}
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
