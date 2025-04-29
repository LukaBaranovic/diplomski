import React, { useEffect, useState } from "react";
import ReceiptDetailsView from "./ReceiptDetailsView"; // Import the new ReceiptDetailsView
import "./ReceiptsView.css";

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
      <div className="popup">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Receipts</h2>
        <div className="date-picker-container">
          <label htmlFor="date-picker">Select Date:</label>
          <input
            type="date"
            id="date-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <table className="receipts-table">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Table Number</th>
              <th>Total Price</th> {/* Display "Total Price" */}
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => {
              const receiptTime = new Date(
                receipt.timestamp
              ).toLocaleTimeString(); // Extract time
              const totalPrice = receipt.total_price || 0; // Default to 0 if total_price is missing
              return (
                <tr
                  key={receipt.receipt_id}
                  onClick={() => handleRowClick(receipt)}
                >
                  <td>{receipt.receipt_id}</td>
                  <td>{receipt.table_number}</td>
                  <td>${Number(totalPrice).toFixed(2)}</td>{" "}
                  {/* Display total_price */}
                  <td>{receiptTime}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show ReceiptDetailsView if a receipt is selected */}
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
