import React, { useEffect, useState } from "react";
import "./CategoryPopup.css"; // Import the CSS file for styling

const CategoryPopup = ({
  categoryId,
  categoryName,
  onClose,
  addItemToCart,
}) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`/api/items/${categoryId}`)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, [categoryId]);

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h2>{categoryName}</h2>
          <hr className="smooth-line" />
        </div>
        <div className="popup-body">
          {items.length > 0 ? (
            <ul className="item-list">
              {items.map((item) => (
                <li
                  key={item.item_id}
                  className="item-container"
                  onClick={() => addItemToCart(item)}
                >
                  <p className="item-name">{item.item_name}</p>
                  <p className="item-price">€{item.item_price}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No items found for this category.</p>
          )}
        </div>
        <div className="popup-footer">
          <hr className="smooth-line" />
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPopup;
