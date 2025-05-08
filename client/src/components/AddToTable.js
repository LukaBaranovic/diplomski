import React, { useEffect, useState } from "react";
import "./PopupStyle.css";
import "./AddToTable.css";

const AddToTable = ({ onClose, onSave }) => {
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/getAvailableTables")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch tables.");
        }
        return res.json();
      })
      .then((data) => setAvailableTables(data))
      .catch(() => setErrorMessage("Nije moguće učitati stolove."));
  }, []);

  const handleTableClick = (tableNumber) => {
    setSelectedTableNumber(tableNumber);
    setErrorMessage("");
  };

  const handleSave = () => {
    if (!selectedTableNumber) {
      setErrorMessage("Molimo odaberite stol.");
      return;
    }
    onSave(selectedTableNumber);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content add-to-table-popup">
        <div className="popup-header">
          <h2>Dodaj na Stol</h2>
        </div>
        <div className="popup-main add-to-table-main">
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
        <div className="popup-footer">
          <button className="popup-button green" onClick={handleSave}>
            Spremi
          </button>
          <button className="popup-button red" onClick={onClose}>
            Otkaži
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToTable;
