import React, { useEffect, useState } from "react";
import "./PopupStyle.css"; // Shared styles
import "./TableDisplay.css";
import TablePopup from "./TablePopup"; // Import the popup component

const TableDisplay = () => {
  const [tableData, setTableData] = useState([]); // State to store table data
  const [error, setError] = useState(""); // State to handle errors
  const [selectedTableNumber, setSelectedTableNumber] = useState(null); // State to track selected table

  // Fetch table data from the backend
  const fetchTableData = () => {
    fetch("/api/getTableData")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch table data.");
        }
        return res.json();
      })
      .then((data) => setTableData(data))
      .catch(() => setError("Failed to load table data."));
  };

  // Polling: Fetch table data every 5 seconds
  useEffect(() => {
    fetchTableData(); // Initial fetch
    const interval = setInterval(() => {
      fetchTableData();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const handleTableClick = (tableNumber) => {
    setSelectedTableNumber(tableNumber); // Open the popup for the selected table
  };

  return (
    <div className="table-display-container">
      {error && <p className="error-message">{error}</p>}
      {tableData.map((table) => (
        <div
          key={table.table_number}
          className="table-container"
          onClick={() => handleTableClick(table.table_number)} // Open popup on click
        >
          <h2>Table {table.table_number}</h2>
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
          onClose={() => setSelectedTableNumber(null)} // Close popup
        />
      )}
    </div>
  );
};

export default TableDisplay;
