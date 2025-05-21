import React, { useState } from "react";
import "./AmountPopup.css";
import "./PopupStyle.css";

const AmountPopup = ({ onClose, onSave, currentAmount }) => {
  const [amount, setAmount] = useState(currentAmount);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
      setErrorMessage("");
    } else if (value === 0) {
      setErrorMessage("Količina ne može biti nula!");
    }
  };

  const handleSave = () => {
    if (amount > 0) {
      onSave(amount);
    } else {
      setErrorMessage("Količina ne može biti nula!");
    }
  };

  const incrementAmount = () => {
    setAmount(amount + 1);
    setErrorMessage("");
  };

  const decrementAmount = () => {
    if (amount > 1) {
      setAmount(amount - 1);
      setErrorMessage("");
    } else {
      setErrorMessage("Količina ne može biti nula!");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h2>Unesi novu količinu</h2>
        </div>
        <div className="popup-main amount-popup-main">
          <input
            type="number"
            value={amount}
            onChange={handleChange}
            min="1"
            className="amount-display"
          />
          <div className="amount-buttons">
            <button className="popup-button blue" onClick={decrementAmount}>
              -
            </button>
            <button className="popup-button blue" onClick={incrementAmount}>
              +
            </button>
          </div>
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

export default AmountPopup;
