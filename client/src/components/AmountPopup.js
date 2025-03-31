import React, { useState } from "react";
import "./AmountPopup.css";

const AmountPopup = ({ onClose, onSave, currentAmount }) => {
  const [amount, setAmount] = useState(currentAmount);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
      setErrorMessage("");
    } else if (value === 0) {
      setErrorMessage("Amount cannot be zero.");
    }
  };

  const handleSave = () => {
    if (amount > 0) {
      onSave(amount);
    } else {
      setErrorMessage("Amount cannot be zero.");
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
      setErrorMessage("Amount cannot be zero.");
    }
  };

  return (
    <div className="amount-popup">
      <div className="amount-popup-content">
        <h3>Unesi Količinu</h3>
        <input type="number" value={amount} onChange={handleChange} min="1" />
        <div className="amount-popup-buttons">
          <button onClick={decrementAmount}>-</button>
          <button onClick={incrementAmount}>+</button>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="amount-popup-buttons">
          <button onClick={handleSave}>Spremi</button>
          <button onClick={onClose}>Otkaži</button>
        </div>
      </div>
    </div>
  );
};

export default AmountPopup;
