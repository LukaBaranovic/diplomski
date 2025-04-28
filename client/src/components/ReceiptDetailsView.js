import React, { useEffect, useState } from "react";
import "./ReceiptDetailsView.css";

const ReceiptDetailsView = ({ receiptId, onClose }) => {
  const [details, setDetails] = useState(null); // State to store receipt details

  // Fetch receipt details when the component mounts
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
    return <div>Loading...</div>;
  }

  return (
    <div className="popup-overlay">
      <div className="popup">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Receipt Details</h2>
        <p>
          <strong>Table Number:</strong> {details.table_number}
        </p>
        <p>
          <strong>Timestamp:</strong>{" "}
          {new Date(details.timestamp).toLocaleString()}
        </p>
        <p>
          <strong>Total Price:</strong> $
          {Number(details.total_price).toFixed(2)}
        </p>{" "}
        {/* Display total price */}
        <table className="details-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
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
    </div>
  );
};

export default ReceiptDetailsView;
