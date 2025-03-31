import React, { useEffect, useState } from "react";
import "./CategoryPopup.css"; // Import the CSS file for styling

const CategoryPopup = ({
  categoryId,
  categoryName,
  onClose,
  addItemToCart,
}) => {
  // Add addItemToCart to props
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`/api/items/${categoryId}`)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, [categoryId]);

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{categoryName}</h2>
        <hr className="smooth-line" />
        {items.length > 0 ? (
          <ul className="item-list">
            {items.map((item) => (
              <li key={item.item_id} className="item-container">
                <p className="item-name">{item.item_name}</p>
                <p className="item-price">€{item.item_price}</p>
                <button onClick={() => addItemToCart(item)}>Dodaj</button>{" "}
                {/* Add button to add items to cart */}
              </li>
            ))}
          </ul>
        ) : (
          <p>No items found for this category.</p>
        )}
        <button onClick={onClose}>Zatvori</button>
      </div>
    </div>
  );
};

export default CategoryPopup;
