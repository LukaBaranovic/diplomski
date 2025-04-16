import React, { useEffect, useState } from "react";
import CategoryList from "./components/CategoryList";
import Cart from "./components/Cart";
import AmountPopup from "./components/AmountPopup";
import CreateTable from "./components/CreateTable"; // Import CreateTable component
import AddToTable from "./components/AddToTable"; // Import AddToTable component
import "./App.css";

function App() {
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showAmountPopup, setShowAmountPopup] = useState(false);
  const [showCreateTablePopup, setShowCreateTablePopup] = useState(false); // State for CreateTable popup
  const [showAddToTablePopup, setShowAddToTablePopup] = useState(false); // State for AddToTable popup

  useEffect(() => {
    // Fetch categories from the server
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  // Function to add an item to the cart
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
  };

  // Function to delete an item from the cart
  const deleteItemFromCart = () => {
    setCartItems(cartItems.filter((item) => item.item_id !== selectedItemId));
    setSelectedItemId(null);
  };

  // Function to open the AmountPopup
  const openAmountPopup = () => {
    setShowAmountPopup(true);
  };

  // Function to close the AmountPopup
  const closeAmountPopup = () => {
    setShowAmountPopup(false);
  };

  // Function to update the amount of an item in the cart
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

  // Get the current quantity of the selected item
  const getSelectedItemAmount = () => {
    const selectedItem = cartItems.find(
      (item) => item.item_id === selectedItemId
    );
    return selectedItem ? selectedItem.quantity : 1;
  };

  // Function to handle saving a table
  const handleSaveTable = (tableNumber, setError) => {
    // Send a POST request to the backend to save cart items in the table_cart database
    fetch("/api/createTable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tableNumber,
        items: cartItems,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error); // Display the error in the popup
        } else {
          alert(data.message); // Success message
          setShowCreateTablePopup(false); // Close the popup
          setCartItems([]); // Clear the cart
        }
      })
      .catch((err) => {
        console.error(err);
        setError("An error occurred while creating the table.");
      });
  };

  // Function to handle adding items to an existing table
  const handleAddToTable = (tableNumber) => {
    // Send a POST request to the backend to add cart items to an existing table
    fetch("/api/addToTable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tableNumber,
        items: cartItems,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error); // Display the error message
        } else {
          alert(data.message); // Success message
          setShowAddToTablePopup(false); // Close the popup
          setCartItems([]); // Clear the cart
        }
      })
      .catch((err) => {
        console.error(err);
        alert("An error occurred while adding items to the table.");
      });
  };

  return (
    <div className="page-container">
      <div className="upper-section">
        {/* Pass categories and addItemToCart to the CategoryList component */}
        <CategoryList categories={categories} addItemToCart={addItemToCart} />
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
          {/* Create Table button */}
          <button
            onClick={() => setShowCreateTablePopup(true)}
            disabled={cartItems.length === 0}
          >
            Create Table
          </button>
          {/* Add to Table button */}
          <button
            onClick={() => setShowAddToTablePopup(true)}
            disabled={cartItems.length === 0}
          >
            Add to Table
          </button>
        </div>
        <div className="right-section">
          {/* Pass cartItems, selectedItemId, and setSelectedItemId to the Cart component */}
          <Cart
            items={cartItems}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
          />
        </div>
      </div>
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
    </div>
  );
}

export default App;
