import React from "react";
import "./Tables.css";

const Tables = ({
  tables,
  selectedTableId,
  setSelectedTableId,
  deleteTable,
}) => {
  return (
    <div className="tables-container">
      {tables.map((table) => (
        <div
          key={table.id}
          className={`table ${selectedTableId === table.id ? "selected" : ""}`}
          onClick={() => setSelectedTableId(table.id)}
        >
          <p>Table {table.id}</p>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {table.items.map((item) => (
                <tr key={item.item_id}>
                  <td>{item.item_name}</td>
                  <td>{item.quantity}</td>
                  <td>
                    {typeof item.price === "number"
                      ? item.price.toFixed(2)
                      : item.price}{" "}
                    $
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTable(table.id);
            }}
          >
            Izbriši
          </button>
        </div>
      ))}
    </div>
  );
};

export default Tables;
