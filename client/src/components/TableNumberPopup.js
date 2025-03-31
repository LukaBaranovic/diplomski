import React, { useState } from "react";
import "./TableNumberPopup.css"; // Import the CSS for this component

const TableNumberPopup = ({ onClose, onSave }) => {
  const [tableNumber, setTableNumber] = useState("");

  const handleInputChange = (event) => {
    setTableNumber(event.target.value);
  };

  const handleClear = () => {
    setTableNumber("");
  };

  const handleSave = () => {
    onSave(tableNumber);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Unesi Broj Stola</h2>
        <input
          type="text"
          value={tableNumber}
          onChange={handleInputChange}
          className="table-input"
          placeholder="Unesi broj stola"
        />
        <div className="popup-buttons">
          <button onClick={handleClear} className="clear-button">
            Očisti
          </button>
          <button onClick={handleSave} className="save-button">
            Spremi
          </button>
          <button onClick={onClose} className="close-button">
            Otkaži
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableNumberPopup;
