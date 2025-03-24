import React, { useEffect, useState } from "react";
import CategoryList from "./components/CategoryList"; // Import the new component
import Cart from "./components/Cart"; // Import the Cart component
import AmountPopup from "./components/AmountPopup"; // Import the AmountPopup component
import "./App.css"; // Import the CSS file for styling

function App() {
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]); // Add state for cart items
  const [selectedItemId, setSelectedItemId] = useState(null); // Add state for selected item
  const [showAmountPopup, setShowAmountPopup] = useState(false); // Add state for showing amount popup

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  const addItemToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (cartItem) => cartItem.item_id === item.item_id
      );
      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.item_id === item.item_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
    saveItemToReceipt(item);
  };

  const saveItemToReceipt = (item) => {
    const receiptItem = {
      item_id: item.item_id,
      item_name: item.item_name,
      quantity: 1,
      price: item.item_price,
      total_price: item.item_price * 1, // For the initial quantity of 1
    };
    fetch("/api/add-to-receipt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(receiptItem),
    })
      .then((res) => res.json())
      .then((data) => console.log("Item added to receipt:", data))
      .catch((err) => console.error("Error adding item to receipt:", err));
  };

  const saveReceipt = () => {
    if (cartItems.length === 0) return;

    const receiptItems = cartItems.map((item) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      quantity: item.quantity,
      price: item.item_price,
      total_price: item.item_price * item.quantity,
    }));

    fetch("/api/save-receipt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(receiptItems),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Receipt saved:", data);
        setCartItems([]); // Clear the cart
      })
      .catch((err) => console.error("Error saving receipt:", err));
  };

  const deleteItemFromCart = () => {
    setCartItems(cartItems.filter((item) => item.item_id !== selectedItemId));
    setSelectedItemId(null);
  };

  const openAmountPopup = () => {
    setShowAmountPopup(true);
  };

  const closeAmountPopup = () => {
    setShowAmountPopup(false);
  };

  const updateItemAmount = (newAmount) => {
    setCartItems(
      cartItems.map((item) =>
        item.item_id === selectedItemId
          ? { ...item, quantity: newAmount }
          : item
      )
    );
    setShowAmountPopup(false);
  };

  const getSelectedItemAmount = () => {
    const selectedItem = cartItems.find(
      (item) => item.item_id === selectedItemId
    );
    return selectedItem ? selectedItem.quantity : 1;
  };

  return (
    <div className="page-container">
      <div className="upper-section">
        <CategoryList categories={categories} addItemToCart={addItemToCart} />{" "}
        {/* Pass categories and addItemToCart to the new component */}
      </div>
      <div className="lower-section">
        <div className="left-section">{/* Content for the left section */}</div>
        <div className="middle-section">
          {/* Delete button */}
          <button onClick={deleteItemFromCart} disabled={!selectedItemId}>
            Delete
          </button>
          {/* Amount button */}
          <button onClick={openAmountPopup} disabled={!selectedItemId}>
            Amount
          </button>
          {/* Add buttons for quantity and message here later */}
        </div>
        <div className="right-section">
          <Cart
            items={cartItems}
            saveReceipt={saveReceipt}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
          />{" "}
          {/* Pass cartItems, saveReceipt, selectedItemId, and setSelectedItemId to the Cart component */}
        </div>
      </div>
      {showAmountPopup && (
        <AmountPopup
          onClose={closeAmountPopup}
          onSave={updateItemAmount}
          currentAmount={getSelectedItemAmount()}
        />
      )}
    </div>
  );
}

export default App;
