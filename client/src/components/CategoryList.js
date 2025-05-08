import React, { useState } from "react";
import "./CategoryList.css";
import CategoryPopup from "./CategoryPopup.js";

const CategoryList = ({ categories, addItemToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleClosePopup = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="category-list">
      {categories.map((category) => (
        <div
          key={category.category_id}
          className="category-container"
          onClick={() => handleCategoryClick(category)}
        >
          {category.category_name}
        </div>
      ))}

      {selectedCategory && (
        <CategoryPopup
          categoryId={selectedCategory.category_id}
          categoryName={selectedCategory.category_name}
          onClose={handleClosePopup}
          addItemToCart={addItemToCart}
        />
      )}
    </div>
  );
};

export default CategoryList;
