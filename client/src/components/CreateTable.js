import React, { useState } from "react";
import "./PopupStyle.css";
import "./CreateTable.css";

const CreateTable = ({ onClose, onSave }) => {
  // Store as string!
  const [tableNumber, setTableNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const value = e.target.value; // Always string
    setTableNumber(value);

    // Only validate if not empty
    if (value === "") {
      setErrorMessage("");
    } else {
      const number = parseInt(value, 10);
      if (!isNaN(number) && number > 0) {
        setErrorMessage("");
      } else if (number === 0) {
        setErrorMessage("Broj stola ne može biti nula!");
      } else {
        setErrorMessage("Unesite ispravan broj stola!");
      }
    }
  };

  const handleSave = () => {
    const number = parseInt(tableNumber, 10);
    if (!isNaN(number) && number > 0) {
      onSave(number, setErrorMessage);
    } else {
      setErrorMessage("Unesite ispravan broj stola!");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
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
            min="1"
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
