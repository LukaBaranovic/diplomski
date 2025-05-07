import React, { useState } from "react";
import "./PopupStyle.css"; // Shared styles
import "./CreateTable.css";

const CreateTable = ({ onClose, onSave }) => {
  const [tableNumber, setTableNumber] = useState(""); // State for the table number
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTableNumber(value);
      setErrorMessage("");
    } else if (value === 0) {
      setErrorMessage("Broj stola ne može biti nula"); // Error message for zero
    }
  };

  const handleSave = () => {
    if (tableNumber > 0) {
      onSave(tableNumber);
    } else {
      setErrorMessage("Unesite ispravan broj stola"); // Error message for invalid input
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content create-table-popup">
        {/* Header Section */}
        <div className="popup-header">
          <div className="header-container">
            <h2>Kreiraj Stol</h2> {/* Title */}
          </div>
          <hr className="smooth-line" />
        </div>

        {/* Main Content Section */}
        <div className="popup-main">
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

        {/* Footer Section */}
        <div className="popup-footer">
          <hr className="smooth-line" />
          <div className="footer-container">
            <div className="popup-buttons">
              <button className="popup-button green" onClick={handleSave}>
                Spremi {/* Save button */}
              </button>
              <button className="popup-button red" onClick={onClose}>
                Otkaži {/* Cancel button */}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTable;
