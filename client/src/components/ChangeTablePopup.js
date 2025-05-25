import React, { useState } from "react";
import "./PopupStyle.css";
import "./CreateTable.css"; // reuse nice input styles

const ChangeTablePopup = ({ currentTableNumber, onClose, onTransfer }) => {
  const [targetTableNumber, setTargetTableNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTargetTableNumber(value);
      setError("");
    } else if (value === 0) {
      setError("Broj stola ne može biti nula!");
    } else {
      setTargetTableNumber("");
    }
  };

  const handleChangeTable = async () => {
    if (!targetTableNumber || targetTableNumber <= 0) {
      setError("Unesite ispravan broj stola!");
      return;
    }
    if (targetTableNumber === currentTableNumber) {
      setError("Ne možete prebaciti na isti stol.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/changeTable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_table_number: currentTableNumber,
          new_table_number: targetTableNumber,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Greška pri prijenosu stola!");
      }
      setLoading(false);
      onTransfer && onTransfer(targetTableNumber);
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h2>Prebaci Stol</h2>
        </div>
        <div className="popup-main create-table-main">
          <label htmlFor="change-table-number" className="input-label">
            Na koji broj stola želite prebaciti?
          </label>
          <input
            id="change-table-number"
            type="number"
            value={targetTableNumber}
            onChange={handleChange}
            placeholder="Broj stola"
            className="table-number-input"
            disabled={loading}
          />
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="popup-footer">
          <button
            className="popup-button green"
            onClick={handleChangeTable}
            disabled={loading}
          >
            {loading ? "Prebacujem..." : "Prebaci"}
          </button>
          <button
            className="popup-button red"
            onClick={onClose}
            disabled={loading}
          >
            Otkaži
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeTablePopup;
