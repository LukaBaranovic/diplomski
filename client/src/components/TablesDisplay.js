import React, { useEffect, useState } from "react";
import "./TablesDisplay.css";

const TablesDisplay = () => {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState("");

  // Fetch tables and their items from the backend
  const fetchTables = () => {
    fetch("/api/getTablesWithItems")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch table data.");
        }
        return res.json();
      })
      .then((data) => setTables(data))
      .catch((err) => setError("Failed to load table data."));
  };

  // Fetch data on component mount and periodically refresh every 10 seconds
  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="tables-display-container">
      <h3>Tables</h3>
      {error && <p className="error-message">{error}</p>}
      {tables.length === 0 ? (
        <p>No tables available.</p>
      ) : (
        tables.map((table) => (
          <div key={table.table_number} className="table-container">
            <h4>Table {table.table_number}</h4>
            <table className="items-table">
              <tbody>
                {table.items.map((item, index) => (
                  <React.Fragment key={item.item_id}>
                    <tr>
                      <td className="item-name">{item.item_name}</td>
                      <td className="item-quantity">
                        Quantity: {item.quantity}
                      </td>
                    </tr>
                    {index < table.items.length - 1 && (
                      <tr>
                        <td colSpan="2">
                          <hr className="item-divider" />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default TablesDisplay;
