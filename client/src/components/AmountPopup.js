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
      setErrorMessage("Količina ne može biti nula"); // Updated message
    }
  };

  const handleSave = () => {
    if (amount > 0) {
      onSave(amount);
    } else {
      setErrorMessage("Količina ne može biti nula"); // Updated message
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
      setErrorMessage("Količina ne može biti nula"); // Updated message
    }
  };

  return (
    <div className="amount-popup">
      <div className="amount-popup-content">
        {/* Header Section */}
        <div className="popup-header">
          <div className="header-container">
            <h3>Unesi novu količinu</h3> {/* Updated header text */}
          </div>
          <hr className="smooth-line" />
        </div>

        {/* Main Content Section */}
        <div className="popup-main">
          <input
            type="number"
            value={amount}
            onChange={handleChange}
            min="1"
            className="amount-display"
          />
          <div className="popup-buttons">
            <button className="popup-button blue" onClick={decrementAmount}>
              -
            </button>
            <button className="popup-button blue" onClick={incrementAmount}>
              +
            </button>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>

        {/* Footer Section */}
        <div className="popup-footer">
          <hr className="smooth-line" />
          <div className="footer-container">
            <div className="popup-buttons">
              <button className="popup-button green" onClick={handleSave}>
                Spremi {/* Changed Save to Spremi */}
              </button>
              <button className="popup-button red" onClick={onClose}>
                Otkaži {/* Changed Cancel to Otkaži */}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmountPopup;
