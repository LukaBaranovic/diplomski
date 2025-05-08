import React, { useState } from "react";
import "./PopupStyle.css"; // Shared styles
import "./CreateTable.css";

const CreateTable = ({ onClose, onSave }) => {
  const [tableNumber, setTableNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTableNumber(value);
      setErrorMessage("");
    } else if (value === 0) {
      setErrorMessage("Broj stola ne može biti nula");
    }
  };

  const handleSave = () => {
    if (tableNumber > 0) {
      onSave(tableNumber);
    } else {
      setErrorMessage("Unesite ispravan broj stola");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content create-table-popup">
        <div className="popup-header">
          <h2>Kreiraj Stol</h2>
        </div>
        <div className="popup-main create-table-main">
          <label htmlFor="table-number" className="input-label">
            Unesite broj stola:
          </label>
          <input
            id="table-number"
            type="number"
            value={tableNumber}
            onChange={handleChange}
            placeholder="Broj stola"
            className="table-number-input"
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}
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

export default CreateTable;
