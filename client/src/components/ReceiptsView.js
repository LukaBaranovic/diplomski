import React, { useEffect, useState } from "react";
import "./PopupStyle.css"; // Shared styles
import "./ReceiptsView.css";
import ReceiptDetailsView from "./ReceiptDetailsView"; // Import the new ReceiptDetailsView

const ReceiptsView = ({ onClose }) => {
  const [receipts, setReceipts] = useState([]); // State to store receipts
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Default to today's date
  const [selectedReceipt, setSelectedReceipt] = useState(null); // State to store selected receipt details

  // Fetch receipts when the popup is opened or the date changes
  useEffect(() => {
    fetch(`/api/getReceipts?date=${selectedDate}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch receipts.");
        }
        return res.json();
      })
      .then(({ receipts }) => {
        setReceipts(receipts);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load receipts.");
      });
  }, [selectedDate]);

  // Handle row click to open the details view
  const handleRowClick = (receipt) => {
    setSelectedReceipt(receipt);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content receipts-view-popup">
        {/* Header container */}
        <div className="popup-header receipts-view-header">
          <h2 className="receipts-view-title">Pregled Računa</h2>
        </div>

        {/* Date picker section */}
        <div className="popup-main">
          <div className="receipts-view-date-picker-container">
            <input
              type="date"
              id="receipts-view-date-picker"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Receipts table */}
          <table className="receipts-view-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Table Number</th>
                <th>Total Price</th>
                <th>Time</th>
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
                    <td>${Number(totalPrice).toFixed(2)}</td>
                    <td>{receiptTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="popup-footer">
          <hr className="smooth-line" />
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
