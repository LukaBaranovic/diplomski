import React, { useEffect, useState } from "react";
import "./TablesDisplay.css";
import TablePopup from "./TablePopup";

const TablesDisplay = () => {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState("");
  const [selectedTable, setSelectedTable] = useState(null); // State for popup

  // Fetch tables for display
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

  // Fetch table details for the popup
  const fetchTableDetails = (tableNumber) => {
    fetch(`/api/getTablePopupDetails/${tableNumber}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedTable({
          tableNumber,
          tableId: tableNumber, // Use tableNumber as tableId
          items: data.items || [], // Pass rows from table_cart
        });
      })
      .catch((err) => console.error("Failed to fetch table details:", err));
  };

  // Close popup
  const closePopup = () => setSelectedTable(null);

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
          <div
            key={table.table_number}
            className="table-container"
            onClick={() => fetchTableDetails(table.table_number)}
          >
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
      {selectedTable && (
        <TablePopup
          tableNumber={selectedTable.tableNumber}
          tableId={selectedTable.tableId} // Pass table_id
          items={selectedTable.items} // Pass items
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default TablesDisplay;
