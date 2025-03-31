import React, { useEffect, useState } from "react";
import CategoryList from "./components/CategoryList"; // Import the new component
import Cart from "./components/Cart"; // Import the Cart component
import AmountPopup from "./components/AmountPopup"; // Import the AmountPopup component
import Tables from "./components/Tables"; // Import the Tables component
import TableNumberPopup from "./components/TableNumberPopup"; // Import the TableNumberPopup component
import TableSelectPopup from "./components/TableSelectPopup"; // Import the TableSelectPopup component
import "./App.css"; // Import the CSS file for styling

function App() {
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]); // Add state for cart items
  const [tables, setTables] = useState([]); // Add state for tables
  const [selectedItemId, setSelectedItemId] = useState(null); // Add state for selected item
  const [showAmountPopup, setShowAmountPopup] = useState(false); // Add state for showing amount popup
  const [showTableNumberPopup, setShowTableNumberPopup] = useState(false); // Add state for showing table number popup
  const [showTableSelectPopup, setShowTableSelectPopup] = useState(false); // Add state for showing table select popup
  const [selectedTableId, setSelectedTableId] = useState(null); // Add state for selected table

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));

    fetch("/api/temporary-receipts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const groupedTables = data.reduce((acc, receipt) => {
            if (!acc[receipt.table_id]) {
              acc[receipt.table_id] = [];
            }
            acc[receipt.table_id].push(receipt);
            return acc;
          }, {});
          const tablesArray = Object.keys(groupedTables).map((tableId) => ({
            id: parseInt(tableId, 10),
            items: groupedTables[tableId],
          }));
          setTables(tablesArray);
        } else {
          console.error("Expected an array but got:", data);
        }
      })
      .catch((error) =>
        console.error("Error fetching temporary receipts:", error)
      );
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

  const openTableNumberPopup = () => {
    setShowTableNumberPopup(true);
  };

  const closeTableNumberPopup = () => {
    setShowTableNumberPopup(false);
  };

  const openTableSelectPopup = () => {
    setShowTableSelectPopup(true);
  };

  const closeTableSelectPopup = () => {
    setShowTableSelectPopup(false);
  };

  const saveReceiptToTable = (tableNumber) => {
    if (cartItems.length === 0 || !tableNumber) return;

    const newTableId = parseInt(tableNumber, 10);

    const receiptItems = cartItems.map((item) => ({
      table_id: newTableId,
      item_id: item.item_id,
      item_name: item.item_name, // Ensure item_name is included
      quantity: item.quantity,
      price: item.item_price,
      total_price: item.item_price * item.quantity,
    }));

    fetch("/api/add-temporary-receipt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: receiptItems }),
    })
      .then((res) => res.json())
      .then((data) => {
        fetch("/api/temporary-receipts")
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              const groupedTables = data.reduce((acc, receipt) => {
                if (!acc[receipt.table_id]) {
                  acc[receipt.table_id] = [];
                }
                acc[receipt.table_id].push(receipt);
                return acc;
              }, {});
              const tablesArray = Object.keys(groupedTables).map((tableId) => ({
                id: parseInt(tableId, 10),
                items: groupedTables[tableId],
              }));
              setTables(tablesArray);
            } else {
              console.error("Expected an array but got:", data);
            }
          })
          .catch((error) =>
            console.error("Error fetching temporary receipts:", error)
          );
        setCartItems([]); // Clear the cart
      })
      .catch((error) =>
        console.error("Error adding temporary receipt:", error)
      );
    closeTableNumberPopup();
  };

  const saveReceiptToExistingTable = (tableId) => {
    if (cartItems.length === 0 || !tableId) return;

    // Fetch existing receipts for the table
    fetch(`/api/temporary-receipts?table_id=${tableId}`)
      .then((res) => res.json())
      .then((existingReceipts) => {
        const updatedItems = cartItems.map((item) => {
          const existingItem = existingReceipts.find(
            (receipt) => receipt.item_id === item.item_id
          );
          if (existingItem) {
            return {
              ...item,
              quantity: item.quantity + existingItem.quantity,
            };
          } else {
            return item;
          }
        });

        const receiptItems = updatedItems.map((item) => ({
          table_id: tableId,
          item_id: item.item_id,
          item_name: item.item_name, // Ensure item_name is included
          quantity: item.quantity,
          price: item.item_price,
          total_price: item.item_price * item.quantity,
        }));

        fetch("/api/save-to-existing-table", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ table_id: tableId, items: receiptItems }),
        })
          .then((res) => res.json())
          .then((data) => {
            fetch("/api/temporary-receipts")
              .then((res) => res.json())
              .then((data) => {
                if (Array.isArray(data)) {
                  const groupedTables = data.reduce((acc, receipt) => {
                    if (!acc[receipt.table_id]) {
                      acc[receipt.table_id] = [];
                    }
                    acc[receipt.table_id].push(receipt);
                    return acc;
                  }, {});
                  const tablesArray = Object.keys(groupedTables).map(
                    (tableId) => ({
                      id: parseInt(tableId, 10),
                      items: groupedTables[tableId],
                    })
                  );
                  setTables(tablesArray);
                } else {
                  console.error("Expected an array but got:", data);
                }
              })
              .catch((error) =>
                console.error("Error fetching temporary receipts:", error)
              );
            setCartItems([]); // Clear the cart
          })
          .catch((error) =>
            console.error("Error saving to existing table:", error)
          );
        closeTableSelectPopup();
      })
      .catch((error) =>
        console.error("Error fetching existing receipts:", error)
      );
  };

  const saveReceipt = () => {
    if (cartItems.length === 0) return;

    const receiptItems = cartItems.map((item) => ({
      item_id: item.item_id,
      item_name: item.item_name, // Ensure item_name is included
      quantity: item.quantity,
      price: item.item_price,
    }));

    fetch("/api/add-receipt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: receiptItems }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Receipt added successfully:", data);
        setCartItems([]); // Clear the cart
      })
      .catch((error) => console.error("Error adding receipt:", error));
  };

  const deleteTable = (tableId) => {
    fetch(`/api/temporary-receipt/${tableId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        setTables(tables.filter((table) => table.id !== tableId));
      })
      .catch((error) =>
        console.error("Error deleting temporary receipt:", error)
      );
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

  useEffect(() => {
    if (selectedTableId !== null) {
      const selectedTable = tables.find(
        (table) => table.id === selectedTableId
      );
      if (selectedTable) {
        setCartItems(selectedTable.items);
      }
    }
  }, [selectedTableId, tables]);

  return (
    <div className="page-container">
      <div className="upper-section">
        <CategoryList categories={categories} addItemToCart={addItemToCart} />{" "}
        {/* Pass categories and addItemToCart to the new component */}
      </div>
      <div className="lower-section">
        <div className="left-section">
          <Tables
            tables={tables}
            selectedTableId={selectedTableId}
            setSelectedTableId={setSelectedTableId}
            deleteTable={deleteTable}
            deleteButtonText="Izbriši" // Update delete button text in lower left section
          />
        </div>
        <div className="middle-section">
          {/* Delete button */}
          <button onClick={deleteItemFromCart} disabled={!selectedItemId}>
            Izbriši
          </button>
          {/* Amount button */}
          <button onClick={openAmountPopup} disabled={!selectedItemId}>
            Količina
          </button>
          {/* Create New Table button */}
          <button
            onClick={openTableNumberPopup}
            disabled={cartItems.length === 0}
          >
            Novi stol
          </button>
          {/* Save to Table button */}
          <button
            onClick={openTableSelectPopup}
            disabled={cartItems.length === 0}
          >
            Spremi na stol
          </button>
        </div>
        <div className="right-section">
          <Cart
            items={cartItems}
            saveReceipt={saveReceipt}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            saveReceiptButtonText="Cash" // Update save receipt button text in lower right section
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
      {showTableNumberPopup && (
        <TableNumberPopup
          onClose={closeTableNumberPopup}
          onSave={saveReceiptToTable}
        />
      )}
      {showTableSelectPopup && (
        <TableSelectPopup
          onClose={closeTableSelectPopup}
          onSave={saveReceiptToExistingTable}
        />
      )}
    </div>
  );
}

export default App;
