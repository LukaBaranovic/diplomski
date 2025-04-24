import React, { useEffect, useState } from "react";
import "./TableDisplay.css";

const TableDisplay = () => {
  const [tableData, setTableData] = useState([]); // State to store table data
  const [error, setError] = useState(""); // State to handle errors

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
      .catch((err) => setError("Failed to load table data."));
  };

  // Polling: Fetch table data every 5 seconds
  useEffect(() => {
    fetchTableData(); // Initial fetch
    const interval = setInterval(() => {
      fetchTableData();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div className="table-display-container">
      {error && <p className="error-message">{error}</p>}
      {tableData.map((table) => (
        <div key={table.table_number} className="table-container">
          <h3>Table {table.table_number}</h3>
          <ul>
            {table.items.map((item) => (
              <li key={item.item_id}>
                {item.item_name} - Quantity: {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default TableDisplay;
