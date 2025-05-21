import React, { useEffect, useState } from "react";
import "./PopupStyle.css";
import "./ReceiptsView.css";
import ReceiptDetailsView from "./ReceiptDetailsView";

const ReceiptsView = ({ onClose }) => {
  const [receipts, setReceipts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [dailyTotal, setDailyTotal] = useState(0);

  useEffect(() => {
    fetch(`/api/getReceipts?date=${selectedDate}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Grešja pri dohvaćanju računa!");
        }
        return res.json();
      })
      .then(({ receipts }) => {
        setReceipts(receipts);
      })
      .catch((err) => {
        console.error(err);
        alert("Greška pri dohvaćanju računa!");
      });
  }, [selectedDate]);

  useEffect(() => {
    fetch(`/api/getDailyTotalPrice?date=${selectedDate}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Greška pri dohvaćanju totala!");
        }
        return res.json();
      })
      .then(({ dailyTotal }) => {
        setDailyTotal(dailyTotal || 0);
      })
      .catch((err) => {
        console.error(err);
        alert("Greška pri dohvaćanju totala!");
      });
  }, [selectedDate]);

  const handleRowClick = (receipt) => {
    setSelectedReceipt(receipt);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-large">
        {/* Header */}
        <div className="popup-header">
          <h2>Pregled Računa</h2>
        </div>

        {/* Main Content */}
        <div className="popup-main">
          {/* Date Picker */}
          <div className="receipts-view-date-picker-container">
            <input
              type="date"
              id="receipts-view-date-picker"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Daily Total Price */}
          <div className="daily-total-container">
            <p>
              <strong>Ukupni Promet za Dan:</strong> €
              {Number(dailyTotal).toFixed(2)}
            </p>
          </div>

          {/* Receipts Table */}
          <table className="receipts-view-table">
            <thead>
              <tr>
                <th>ID Računa</th>
                <th>Broj Stola</th>
                <th>Ukupna Cijena</th>
                <th>Vrijeme</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => {
                const receiptTime = new Date(
                  receipt.timestamp
                ).toLocaleTimeString();
                const totalPrice = receipt.total_price || 0;
                return (
                  <tr
                    key={receipt.receipt_id}
                    onClick={() => handleRowClick(receipt)}
                  >
                    <td>{receipt.receipt_id}</td>
                    <td>{receipt.table_number}</td>
                    <td>€{Number(totalPrice).toFixed(2)}</td>
                    <td>{receiptTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="popup-footer">
          <button className="popup-button red" onClick={onClose}>
            Otkaži
          </button>
        </div>
      </div>

      {/* Receipt details view */}
      {selectedReceipt && (
        <ReceiptDetailsView
          receiptId={selectedReceipt.receipt_id}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};

export default ReceiptsView;
