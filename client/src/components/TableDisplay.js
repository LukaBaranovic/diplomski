import React, { useEffect, useState } from "react";
import TablePopup from "./TablePopup";
import "./TableDisplay.css";

const TableDisplay = () => {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState("");
  const [selectedTableNumber, setSelectedTableNumber] = useState(null);

  useEffect(() => {
    const fetchTableData = () => {
      fetch("/api/getTableData")
        .then((res) => {
          if (!res.ok) {
            throw new Error("Greška pri dohvaćanju detalja stola!");
          }
          return res.json();
        })
        .then((data) => setTableData(data))
        .catch(() => setError("Greška pri dohvaćanju detalja stola!"));
    };

    fetchTableData();
    const interval = setInterval(fetchTableData, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleTableClick = (tableNumber) => {
    setSelectedTableNumber(tableNumber);
  };

  return (
    <div className="table-display-container">
      {error && <p className="error-message">{error}</p>}
      {tableData.map((table) => (
        <div
          key={table.table_number}
          className="table-container"
          data-table-number={table.table_number}
          onClick={() => handleTableClick(table.table_number)}
        >
          <h3>Stol {table.table_number}</h3>
          <ul>
            {table.items.map((item) => (
              <li key={item.item_id}>
                <span className="item-name">{item.item_name}</span>
                <span className="item-quantity">{item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {selectedTableNumber && (
        <TablePopup
          tableNumber={selectedTableNumber}
          onClose={() => setSelectedTableNumber(null)}
        />
      )}
    </div>
  );
};

export default TableDisplay;
