import React, { useState, useEffect } from "react";
import "./TableSelectPopup.css";

const TableSelectPopup = ({ onClose, onSave }) => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    // Fetch existing table numbers from the backend
    fetch("/api/get-existing-tables")
      .then((response) => response.json())
      .then((tables) => {
        setTables(tables);
      })
      .catch((error) => {
        console.error("Error fetching tables:", error);
      });
  }, []);

  return (
    <div className="popup">
      <div className="popup-inner">
        <h3>Odaberi Stol</h3>
        <div className="table-numbers">
          {tables.map((table) => (
            <button key={table.table_id} onClick={() => onSave(table.table_id)}>
              {table.table_id}
            </button>
          ))}
        </div>
        <button className="close-btn" onClick={onClose}>
          Otkaži
        </button>
      </div>
    </div>
  );
};

export default TableSelectPopup;
