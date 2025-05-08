import React, { useEffect, useState } from "react";
import "./TablePopup.css";
import "./PopupStyle.css";

const TablePopup = ({ tableNumber, onClose }) => {
  const [tableItems, setTableItems] = useState(null);
  const [error, setError] = useState("");
  const [updatedQuantities, setUpdatedQuantities] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetch(`/api/getTableItemsByNumber/${tableNumber}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch table items.");
        }
        return res.json();
      })
      .then((data) => {
        setTableItems(data);
        const initialQuantities = {};
        let initialTotalPrice = 0;

        data.forEach((item) => {
          initialQuantities[item.item_name] = item.quantity;
          initialTotalPrice += item.quantity * item.item_price;
        });

        setUpdatedQuantities(initialQuantities);
        setTotalPrice(initialTotalPrice);
      })
      .catch(() => setError("Failed to load table items."));
  }, [tableNumber]);

  const calculateTotalPrice = (items, quantities) => {
    return items.reduce((total, item) => {
      return total + item.item_price * (quantities[item.item_name] || 0);
    }, 0);
  };

  const handleDelete = (itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`))
      return;

    fetch(`/api/deleteTableItem`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_number: tableNumber, item_name: itemName }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete the item.");
        }
        return res.json();
      })
      .then((updatedItems) => {
        setTableItems(updatedItems);
        setTotalPrice(calculateTotalPrice(updatedItems, updatedQuantities));
        setError("");
      })
      .catch(() => setError(`Failed to delete the item "${itemName}".`));
  };

  const handleQuantityChange = (itemName, change) => {
    setUpdatedQuantities((prevState) => {
      const newQuantity = Math.max(1, prevState[itemName] + change);
      return { ...prevState, [itemName]: newQuantity };
    });
  };

  const handleConfirmQuantity = (itemName) => {
    const newQuantity = updatedQuantities[itemName];
    fetch(`/api/updateItemQuantity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_number: tableNumber,
        item_name: itemName,
        quantity: newQuantity,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update quantity.");
        }
        return res.json();
      })
      .then((updatedItems) => {
        setTableItems(updatedItems);
        setTotalPrice(calculateTotalPrice(updatedItems, updatedQuantities));
        setError("");
      })
      .catch(() => setError(`Failed to update quantity for "${itemName}".`));
  };

  const handleDeleteTable = () => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;

    fetch(`/api/deleteTable`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_number: tableNumber }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete the table.");
        }
        onClose();
        setError("");
      })
      .catch(() => setError("Failed to delete the table."));
  };

  const handleCash = () => {
    if (!window.confirm("Are you sure you want to finalize this table?"))
      return;

    fetch(`/api/cashTable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_number: tableNumber }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to process the cash operation.");
        }
        onClose();
        setError("");
      })
      .catch(() => setError("Failed to finalize and save the table."));
  };

  return (
    <div className="popup-overlay">
      <div className="popup-large">
        <div className="popup-header">
          <h2>Stol {tableNumber}</h2>
        </div>
        <div className="popup-main">
          {error ? (
            <p className="error-message">{error}</p>
          ) : !tableItems ? (
            <p>Loading...</p>
          ) : (
            <>
              <table className="item-table">
                <thead>
                  <tr>
                    <th>Naziv artikla</th>
                    <th>Količina</th>
                    <th>Cijena</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tableItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item_name}</td>
                      <td>
                        <div className="quantity-controller">
                          <button
                            className="popup-button"
                            onClick={() =>
                              handleQuantityChange(item.item_name, -1)
                            }
                          >
                            -
                          </button>
                          <span>{updatedQuantities[item.item_name]}</span>
                          <button
                            className="popup-button"
                            onClick={() =>
                              handleQuantityChange(item.item_name, 1)
                            }
                          >
                            +
                          </button>
                          <button
                            className="popup-button green"
                            onClick={() =>
                              handleConfirmQuantity(item.item_name)
                            }
                          >
                            Potvrdi
                          </button>
                        </div>
                      </td>
                      <td>
                        €
                        {(
                          updatedQuantities[item.item_name] * item.item_price
                        ).toFixed(2)}
                      </td>
                      <td>
                        <button
                          className="popup-button red"
                          onClick={() => handleDelete(item.item_name)}
                        >
                          Izbriši
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total-price-container">
                <h3>Ukupno: €{totalPrice.toFixed(2)}</h3>
              </div>
            </>
          )}
        </div>
        <div className="popup-footer">
          <button className="popup-button green" onClick={handleCash}>
            Račun
          </button>
          <button className="popup-button red" onClick={handleDeleteTable}>
            Izbriši Stol
          </button>
          <button className="popup-button red" onClick={onClose}>
            Otkaži
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePopup;
