import React, { useEffect, useState } from "react";
import CategoryList from "./components/CategoryList";
import Cart from "./components/Cart";
import AmountPopup from "./components/AmountPopup";
import CreateTable from "./components/CreateTable";
import AddToTable from "./components/AddToTable";
import TableDisplay from "./components/TableDisplay";
import ReceiptsView from "./components/ReceiptsView";
import "./App.css";

function App() {
  // State Hooks
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showAmountPopup, setShowAmountPopup] = useState(false);
  const [showCreateTablePopup, setShowCreateTablePopup] = useState(false);
  const [showAddToTablePopup, setShowAddToTablePopup] = useState(false);
  const [showReceiptsPopup, setShowReceiptsPopup] = useState(false);

  // Fetch Categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  // Cart Management
  const addItemToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (cartItem) => cartItem.item_id === item.item_id
      );
      return existingItem
        ? prevItems.map((cartItem) =>
            cartItem.item_id === item.item_id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        : [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const deleteItemFromCart = () => {
    setCartItems(cartItems.filter((item) => item.item_id !== selectedItemId));
    setSelectedItemId(null);
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

  // Popup Handlers
  const closeAmountPopup = () => setShowAmountPopup(false);
  const handleSaveTable = (tableNumber, setError) => {
    fetch("/api/createTable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNumber, items: cartItems }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          alert(data.message);
          setShowCreateTablePopup(false);
          setCartItems([]);
        }
      })
      .catch(() => setError("An error occurred while creating the table."));
  };

  const handleAddToTable = (tableNumber) => {
    fetch("/api/addToTable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNumber, items: cartItems }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          alert(data.message);
          setShowAddToTablePopup(false);
          setCartItems([]);
        }
      })
      .catch(() => alert("An error occurred while adding items to the table."));
  };

  return (
    <div className="page-container">
      {/* Category Section */}
      <div className="upper-section">
        <CategoryList categories={categories} addItemToCart={addItemToCart} />
      </div>

      {/* Cart and Table Section */}
      <div className="lower-section">
        <div className="left-section">
          <TableDisplay />
        </div>

        <div className="middle-section">
          <button
            className="functionality-button"
            onClick={deleteItemFromCart}
            disabled={!selectedItemId}
          >
            Izbriši
          </button>
          <button
            className="functionality-button"
            onClick={() => setShowAmountPopup(true)}
            disabled={!selectedItemId}
          >
            Količina
          </button>
          <button
            className="functionality-button"
            onClick={() => setShowCreateTablePopup(true)}
            disabled={cartItems.length === 0}
          >
            Novi Stol
          </button>
          <button
            className="functionality-button"
            onClick={() => setShowAddToTablePopup(true)}
            disabled={cartItems.length === 0}
          >
            Dodaj na Stol
          </button>
          <button
            className="functionality-button"
            onClick={() => setShowReceiptsPopup(true)}
          >
            Pregled
          </button>
        </div>

        <div className="right-section">
          <Cart
            items={cartItems}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
          />
        </div>
      </div>

      {/* Popups */}
      {showAmountPopup && (
        <AmountPopup
          onClose={closeAmountPopup}
          onSave={updateItemAmount}
          currentAmount={getSelectedItemAmount()}
        />
      )}
      {showCreateTablePopup && (
        <CreateTable
          onClose={() => setShowCreateTablePopup(false)}
          onSave={handleSaveTable}
        />
      )}
      {showAddToTablePopup && (
        <AddToTable
          onClose={() => setShowAddToTablePopup(false)}
          onSave={handleAddToTable}
        />
      )}
      {showReceiptsPopup && (
        <ReceiptsView onClose={() => setShowReceiptsPopup(false)} />
      )}
    </div>
  );
}

export default App;
