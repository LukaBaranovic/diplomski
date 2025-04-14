import React from "react";
import "./Tables.css";

const Tables = ({ tables, onTableClick, deleteTable }) => {
  return (
    <div className="tables-container">
      {tables.map((table) => (
        <div
          key={table.id}
          className="table"
          onClick={() => onTableClick(table.id)} // Trigger the popup on click
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
                      : "N/A"}{" "}
                    $ {/* Fallback to "N/A" if price is not a number */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Tables;
