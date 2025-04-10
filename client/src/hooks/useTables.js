import { useState, useEffect } from "react";

const useTables = (cartItems, setCartItems) => {
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [showTableNumberPopup, setShowTableNumberPopup] = useState(false);
  const [showTableSelectPopup, setShowTableSelectPopup] = useState(false);

  useEffect(() => {
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
    setShowTableNumberPopup(false);
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
        setShowTableSelectPopup(false);
      })
      .catch((error) =>
        console.error("Error fetching existing receipts:", error)
      );
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

  return {
    tables,
    selectedTableId,
    setSelectedTableId,
    showTableNumberPopup,
    setShowTableNumberPopup,
    showTableSelectPopup,
    setShowTableSelectPopup,
    saveReceiptToTable,
    saveReceiptToExistingTable,
    deleteTable,
  };
};

export default useTables;
