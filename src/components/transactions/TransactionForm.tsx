import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { DateTime } from "luxon";
import {
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  useMediaQuery,
} from "@mui/material";
import useThemeDetect from "../../hooks/useThemeDetect";
import Button from "../styled-components/Button";

interface TransactionFormProps {
  fetchTransactions: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  fetchTransactions,
}) => {
  const { theme } = useThemeDetect();
  const isMobile = useMediaQuery(`(max-width: 600px)`);

  const [customerName, setCustomerName] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [sellPrice, setSellPrice] = useState(0);
  const [sourcePrice, setSourcePrice] = useState(0);
  const [priceType, setPriceType] = useState("retail");
  const [transactionDate, setTransactionDate] = useState<string>(
    DateTime.now().setZone("UTC+2").toFormat("yyyy-LL-dd'T'HH:mm")
  );

  const [providers, setProviders] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      const providersSnapshot = await getDocs(collection(db, "settings"));
      providersSnapshot.forEach((doc) => {
        if (doc.id === "providers") {
          setProviders(doc.data().name || []);
        }
      });
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesSnapshot = await getDocs(collection(db, "settings"));
      categoriesSnapshot.forEach((doc) => {
        if (doc.id === "categories") {
          setCategories(doc.data().name || []);
        }
      });
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedProvider || !selectedCategory) {
      setItems([]);
      setSelectedItem("");
      return;
    }

    const fetchItems = async () => {
      const itemsSnapshot = await getDocs(
        collection(db, "providers", selectedProvider, selectedCategory)
      );
      const itemList = itemsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemList);
    };

    fetchItems();
  }, [selectedProvider, selectedCategory]);

  useEffect(() => {
    if (!selectedItem || !selectedProvider || !selectedCategory) return;

    const fetchItemDetails = async () => {
      const itemRef = doc(
        db,
        "providers",
        selectedProvider,
        selectedCategory,
        selectedItem
      );
      const itemDoc = await getDoc(itemRef);
      if (itemDoc.exists()) {
        const data = itemDoc.data();
        let fetchedSourcePrice = data.source_price;
        let fetchedSellPrice =
          priceType === "retail" ? data.retail_price : data.wholesale_price;
        setSourcePrice(fetchedSourcePrice);
        setSellPrice(fetchedSellPrice);
      }
    };

    fetchItemDetails();
  }, [selectedItem, priceType, selectedProvider, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const revenue = sellPrice - sourcePrice;
    try {
      await addDoc(collection(db, "transactions"), {
        customerName,
        provider: selectedProvider,
        category: selectedCategory,
        item: selectedItem,
        sourcePrice,
        sellPrice,
        revenue,
        date: Timestamp.fromDate(new Date(transactionDate)),
      });
      fetchTransactions();
      setCustomerName("");
      setSelectedProvider("");
      setSelectedCategory("");
      setItems([]);
      setSelectedItem("");
      setSellPrice(0);
      setSourcePrice(0);
      setPriceType("");
      setTransactionDate(
        DateTime.now().setZone("UTC+2").toFormat("yyyy-LL-dd'T'HH:mm")
      );
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <Box
      sx={{
        padding: "2rem",
        backgroundColor: theme.cardBackground,
        borderRadius: "12px",
        maxWidth: isMobile ? "100%" : "650px",
        margin: "auto",
        boxShadow: `0px 6px 12px ${theme.shadow}`,
        height: "100%",
        overflowX: "hidden", // Prevent horizontal scrolling
      }}
    >
      <form onSubmit={handleSubmit}>
        <TextField
          label="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          size="small"
          margin="normal"
          variant="outlined"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: theme.inputBackground,
              color: theme.inputText,
              borderRadius: "8px",
              "& fieldset": {
                borderColor: theme.borderColor,
              },
              "&:hover fieldset": {
                borderColor: theme.primary,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.primary,
              },
            },
            "& .MuiInputLabel-root": {
              color: theme.text,
            },
          }}
        />

        {/* Provider Selector */}
        <FormControl fullWidth size="small" required margin="normal">
          <InputLabel sx={{ color: theme.text }}>Provider</InputLabel>
          <Select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as string)}
            label="Provider"
            sx={{
              backgroundColor: theme.inputBackground,
              width: "100%", // Set consistent width
              color: theme.inputText,
              borderRadius: "8px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.borderColor,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary,
              },
            }}
          >
            {providers.map((prov) => (
              <MenuItem key={prov} value={prov}>
                {prov}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Category Selector */}
        <FormControl fullWidth size="small" required margin="normal">
          <InputLabel sx={{ color: theme.text }}>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as string)}
            label="Category"
            sx={{
              backgroundColor: theme.inputBackground,
              color: theme.inputText,
              width: "100%", // Set consistent width
              borderRadius: "8px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.borderColor,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary,
              },
            }}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Item Selector */}
        <FormControl fullWidth size="small" required margin="normal">
          <InputLabel sx={{ color: theme.text }}>Item</InputLabel>
          <Select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value as string)}
            label="Item"
            sx={{
              backgroundColor: theme.inputBackground,
              color: theme.inputText,
              borderRadius: "8px",
              width: "100%", // Set consistent width
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.borderColor,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary,
              },
            }}
          >
            {items.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Transaction Date */}
        <TextField
          label="Transaction Date"
          type="datetime-local"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          required
          size="small"
          margin="normal"
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: theme.inputBackground,
              color: theme.inputText,
              borderRadius: "8px",
              "& fieldset": {
                borderColor: theme.borderColor,
              },
              "&:hover fieldset": {
                borderColor: theme.primary,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.primary,
              },
            },
            "& .MuiInputLabel-root": {
              color: theme.text,
            },
          }}
        />

        {/* Price Type Selector */}
        <FormControl fullWidth size="small" required margin="normal">
          <InputLabel sx={{ color: theme.text }}>Price Type</InputLabel>
          <Select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value as string)}
            label="Price Type"
            sx={{
              backgroundColor: theme.inputBackground,
              color: theme.inputText,
              width: "100%", // Set consistent width
              borderRadius: "8px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.borderColor,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary,
              },
            }}
          >
            <MenuItem value="retail">Retail</MenuItem>
            <MenuItem value="wholesale">Wholesale</MenuItem>
          </Select>
        </FormControl>

        {/* Sell Price */}
        <TextField
          label="Sell Price"
          type="number"
          value={sellPrice}
          onChange={(e) => setSellPrice(Number(e.target.value))}
          required
          size="small"
          margin="normal"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: theme.inputBackground,
              color: theme.inputText,
              borderRadius: "8px",
              "& fieldset": {
                borderColor: theme.borderColor,
              },
              "&:hover fieldset": {
                borderColor: theme.primary,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.primary,
              },
            },
            "& .MuiInputLabel-root": {
              color: theme.text,
            },
          }}
        />

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          size="large"
          padding="12px"
          fontSize="1rem"
          borderRadius="8px"
          width="100%"
          margin="10px 0px 0px 0px"
        >
          Add Transaction
        </Button>
      </form>
    </Box>
  );
};

export default TransactionForm;
