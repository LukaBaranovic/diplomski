import { useState } from "react";

const useCart = (setTables) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showAmountPopup, setShowAmountPopup] = useState(false);

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

  return {
    cartItems,
    selectedItemId,
    setSelectedItemId,
    showAmountPopup,
    addItemToCart,
    deleteItemFromCart,
    openAmountPopup,
    closeAmountPopup,
    updateItemAmount,
    getSelectedItemAmount,
  };
};

export default useCart;
