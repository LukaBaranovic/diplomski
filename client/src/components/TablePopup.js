import React from "react";
import "./TablePopup.css";

const TablePopup = ({ tableNumber, tableId, onClose }) => {
  return (
    <div className="table-popup-overlay">
      <div className="table-popup-container">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h3>Table {tableNumber} Details</h3>
        <p>Table ID: {tableId}</p>
      </div>
    </div>
  );
};

export default TablePopup;
