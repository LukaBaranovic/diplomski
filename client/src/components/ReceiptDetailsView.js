import React, { useEffect, useState } from "react";
import "./PopupStyle.css"; // Shared styles
import "./ReceiptDetailsView.css";

const ReceiptDetailsView = ({ receiptId, onClose }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetch(`/api/getReceiptDetails?receiptId=${receiptId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch receipt details.");
        }
        return res.json();
      })
      .then((data) => {
        setDetails(data);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load receipt details.");
      });
  }, [receiptId]);

  if (!details) {
    return (
      <div className="popup-overlay">
        <div className="popup-large">
          <div className="popup-main">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup-large">
        <div className="popup-header">
          <h2>Detalji Računa</h2>
        </div>
        <div className="popup-main">
          <p>
            <strong>Broj Stola:</strong> {details.table_number}
          </p>
          <p>
            <strong>Vrijeme:</strong>{" "}
            {new Date(details.timestamp).toLocaleString()}
          </p>
          <p>
            <strong>Ukupna Cijena:</strong> $
            {Number(details.total_price).toFixed(2)}
          </p>
          <table className="details-table">
            <thead>
              <tr>
                <th>Naziv Artikla</th>
                <th>Količina</th>
                <th>Cijena</th>
              </tr>
            </thead>
            <tbody>
              {details.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.item_name}</td>
                  <td>{item.quantity}</td>
                  <td>${Number(item.total_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="popup-footer">
          <button className="popup-button red" onClick={onClose}>
            Otkaži
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetailsView;
