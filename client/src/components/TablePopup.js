import React, { useEffect, useState } from "react";
import "./TablePopup.css";
import "./PopupStyle.css";
import ChangeTablePopup from "./ChangeTablePopup";

const TablePopup = ({ tableNumber, onClose }) => {
  const [tableItems, setTableItems] = useState(null);
  const [error, setError] = useState("");
  const [updatedQuantities, setUpdatedQuantities] = useState({});
  const [originalQuantities, setOriginalQuantities] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [showChangeTablePopup, setShowChangeTablePopup] = useState(false);

  useEffect(() => {
    fetch(`/api/getTableItemsByNumber/${tableNumber}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Greška pri dohvaćanju artikala na stolu!");
        }
        return res.json();
      })
      .then((data) => {
        setTableItems(data);
        const initialQuantities = {};
        const origQuantities = {};
        let initialTotalPrice = 0;

        data.forEach((item) => {
          initialQuantities[item.item_name] = item.quantity;
          origQuantities[item.item_name] = item.quantity;
          initialTotalPrice += item.quantity * item.item_price;
        });

        setUpdatedQuantities(initialQuantities);
        setOriginalQuantities(origQuantities);
        setTotalPrice(initialTotalPrice);
      })
      .catch(() => setError("Greška pri dohvaćanju artikala na stolu!"));
  }, [tableNumber]);

  const calculateTotalPrice = (items, quantities) => {
    return items.reduce((total, item) => {
      return total + item.item_price * (quantities[item.item_name] || 0);
    }, 0);
  };

  const handleDelete = (itemName) => {
    if (!window.confirm(`Jeste li sigurni da želite obrisati: "${itemName}"?`))
      return;

    fetch(`/api/deleteTableItem`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_number: tableNumber, item_name: itemName }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Greška pri brisanju artikla!");
        }
        return res.json();
      })
      .then((updatedItems) => {
        setTableItems(updatedItems);

        setUpdatedQuantities((prev) => {
          const copy = { ...prev };
          delete copy[itemName];
          return copy;
        });
        setOriginalQuantities((prev) => {
          const copy = { ...prev };
          delete copy[itemName];
          return copy;
        });

        setTotalPrice(calculateTotalPrice(updatedItems, updatedQuantities));
        setError("");
      })
      .catch(() => setError(`Greška pri brisanju artikla: "${itemName}".`));
  };

  const handleQuantityChange = (itemName, change) => {
    setUpdatedQuantities((prevState) => {
      const newQuantity = Math.max(1, prevState[itemName] + change);
      return { ...prevState, [itemName]: newQuantity };
    });
  };

  const handleConfirmQuantity = (itemName) => {
    const newQuantity = updatedQuantities[itemName];
    if (newQuantity === originalQuantities[itemName]) {
      return;
    }
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
          throw new Error("Greška pri ažuriranju količine!");
        }
        return res.json();
      })
      .then((updatedItems) => {
        setTableItems(updatedItems);
        setOriginalQuantities((prev) => ({
          ...prev,
          [itemName]: newQuantity,
        }));
        setTotalPrice(calculateTotalPrice(updatedItems, updatedQuantities));
        setError("");
      })
      .catch(() =>
        setError(`Greška pri ažuriranju količine za: "${itemName}".`)
      );
  };

  const handleDeleteTable = () => {
    if (!window.confirm("Jeste li sigurni da žeite obrisati ovaj stol?"))
      return;

    fetch(`/api/deleteTable`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_number: tableNumber }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Greška pri brisanju stola!");
        }
        onClose();
        setError("");
      })
      .catch(() => setError("Greška pri brisanju stola!"));
  };

  const handleCash = () => {
    //if (!window.confirm("Jeste li sigurni da želite finalizirati stol?"))
    //  return;

    fetch(`/api/cashTable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_number: tableNumber }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Greška pri finaliziranju stola!");
        }
        onClose();
        setError("");
      })
      .catch(() => setError("Greška pri finaliziranju stola!"));
  };

  const handleChangeTableSuccess = (newTableNumber) => {
    onClose();
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
            <p>Učitavanje...</p>
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
                  {tableItems.map((item, index) => {
                    const isChanged =
                      updatedQuantities[item.item_name] !==
                      originalQuantities[item.item_name];
                    return (
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
                              className="popup-button confirm-btn"
                              style={{
                                backgroundColor: isChanged ? "#4caf50" : "#ccc",
                                color: isChanged ? "#fff" : "#333",
                                cursor: isChanged ? "pointer" : "not-allowed",
                                border: isChanged
                                  ? "1px solid #388e3c"
                                  : "1px solid #ccc",
                                marginLeft: "8px",
                              }}
                              onClick={() =>
                                isChanged &&
                                handleConfirmQuantity(item.item_name)
                              }
                              disabled={!isChanged}
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
                    );
                  })}
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
          <button
            className="popup-button"
            style={{ backgroundColor: "#007bff", color: "#fff" }}
            onClick={() => setShowChangeTablePopup(true)}
          >
            Prebaci
          </button>
          <button className="popup-button red" onClick={handleDeleteTable}>
            Izbriši Stol
          </button>
          <button className="popup-button red" onClick={onClose}>
            Otkaži
          </button>
        </div>
      </div>
      {showChangeTablePopup && (
        <ChangeTablePopup
          currentTableNumber={tableNumber}
          onClose={() => setShowChangeTablePopup(false)}
          onTransfer={handleChangeTableSuccess}
        />
      )}
    </div>
  );
};

export default TablePopup;
