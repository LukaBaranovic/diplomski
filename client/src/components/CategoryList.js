import React, { useState } from "react";
import "./CategoryList.css"; // Import the CSS file
import CategoryPopup from "./CategoryPopup.js"; // Import the popup component

const CategoryList = ({ categories, addItemToCart }) => {
  // Add addItemToCart to props
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleClosePopup = () => {
    setSelectedCategory(null);
  };

  return (
    <div>
      <ul>
        {categories.map((category) => (
          <li
            key={category.category_id}
            className="category-container"
            onClick={() => handleCategoryClick(category)}
          >
            {category.category_name}
          </li>
        ))}
      </ul>
      {selectedCategory && (
        <CategoryPopup
          categoryId={selectedCategory.category_id}
          categoryName={selectedCategory.category_name}
          onClose={handleClosePopup}
          addItemToCart={addItemToCart} // Pass addItemToCart to CategoryPopup
        />
      )}
    </div>
  );
};

export default CategoryList;
