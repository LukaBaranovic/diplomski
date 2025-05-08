import React, { useEffect, useState } from "react";
import "./CategoryPopup.css"; // Use only specific styles for CategoryPopup

const CategoryPopup = ({
  categoryId,
  categoryName,
  onClose,
  addItemToCart,
}) => {
  const [items, setItems] = useState([]);
  const [addedItems, setAddedItems] = useState(new Set());

  useEffect(() => {
    // Fetch items for the selected category
    fetch(`/api/items/${categoryId}`)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, [categoryId]);

  const handleAddToCart = (item) => {
    addItemToCart(item);
    setAddedItems((prev) => new Set(prev).add(item.item_id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const updated = new Set(prev);
        updated.delete(item.item_id);
        return updated;
      });
    }, 1000); // Reset the "added" state after 1 second
  };

  return (
    <div className="popup-overlay">
      <div className="category-popup">
        {/* Header */}
        <div className="popup-header">
          <h2>{categoryName}</h2>
        </div>

        {/* Main Content */}
        <div className="popup-main">
          {items.length > 0 ? (
            <ul className="item-list">
              {items.map((item) => (
                <li
                  key={item.item_id}
                  className={`item-container ${
                    addedItems.has(item.item_id) ? "added" : ""
                  }`}
                  onClick={() => handleAddToCart(item)}
                >
                  <p className="item-name">{item.item_name}</p>
                  <p className="item-price">€{item.item_price}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nema artikala u ovoj kategoriji.</p>
          )}
        </div>

        {/* Footer */}
        <div className="popup-footer">
          <button className="popup-button red" onClick={onClose}>
            Otkaži
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPopup;
