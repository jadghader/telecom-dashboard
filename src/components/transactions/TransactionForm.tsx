import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { DateTime } from "luxon";
import { db } from "../../firebase";
import useThemeDetect from "../../hooks/useThemeDetect";
import Button from "../styled-components/Button";

const LAST_INPUT_KEY = "telecom:last-transaction-input";
const NEW_PRODUCT_VALUE = "__new_product__";

interface TransactionFormProps {
  fetchTransactions: () => Promise<void>;
}

interface ItemDoc {
  id: string;
  name?: string;
  providerId?: string;
  categoryId?: string;
  prices?: {
    source?: number;
    retail?: number;
    wholesale?: number;
  };
  isActive?: boolean;
}

interface LastInput {
  customerName: string;
  selectedProvider: string;
  selectedCategory: string;
  selectedItem: string;
  newProductName: string;
  priceType: "retail" | "wholesale";
  sourcePrice: number;
  sellPrice: number;
  quantity: number;
}

const toCustomerId = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const toMonthKey = (dateValue: string) => {
  const jsDate = new Date(dateValue);
  if (Number.isNaN(jsDate.getTime())) {
    return new Date().toISOString().slice(0, 7);
  }
  return jsDate.toISOString().slice(0, 7);
};

const computeTotals = (entries: any[]) =>
  entries.reduce(
    (acc, current) => ({
      quantity: acc.quantity + Number(current.quantity || 0),
      totalCost:
        acc.totalCost + Number(current.sourcePrice || 0) * Number(current.quantity || 0),
      totalSales:
        acc.totalSales + Number(current.sellPrice || 0) * Number(current.quantity || 0),
      totalProfit: acc.totalProfit + Number(current.revenue || 0),
    }),
    { quantity: 0, totalCost: 0, totalSales: 0, totalProfit: 0 }
  );

const TransactionForm: React.FC<TransactionFormProps> = ({ fetchTransactions }) => {
  const { theme } = useThemeDetect();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [isAdding, setIsAdding] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [customerName, setCustomerName] = useState("");
  const [customers, setCustomers] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [sellPrice, setSellPrice] = useState(0);
  const [sourcePrice, setSourcePrice] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [priceType, setPriceType] = useState<"retail" | "wholesale">("retail");
  const [transactionDate, setTransactionDate] = useState<string>(
    DateTime.now().setZone("UTC+2").toFormat("yyyy-LL-dd'T'HH:mm")
  );

  const [providers, setProviders] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<ItemDoc[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  const fieldSx = useMemo(() => ({
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.inputBackground,
      borderRadius: "12px",
      color: theme.inputText,
      transition: "all 0.3s ease",
      "& fieldset": {
        borderColor: theme.borderColor,
        borderWidth: "1.5px",
      },
      "&:hover fieldset": {
        borderColor: theme.primary,
        borderWidth: "1.5px",
      },
      "&.Mui-focused": {
        backgroundColor: theme.cardBackground,
        "& fieldset": {
          borderColor: theme.primary,
          borderWidth: "2px",
          boxShadow: `0 0 0 3px rgba(102, 126, 234, 0.1)`,
        },
      },
    },
    "& .MuiInputLabel-root": {
      color: theme.textMuted,
      fontSize: "0.9rem",
      transition: "all 0.3s ease",
      "&.Mui-focused": {
        color: theme.primary,
        fontWeight: 600,
      },
    },
    "& .MuiInputBase-input": {
      color: theme.inputText,
      fontSize: "0.95rem",
      fontWeight: 500,
      "&::placeholder": {
        color: theme.placeholderColor,
        opacity: 0.7,
      },
    },
    "& .MuiSelect-icon": {
      color: theme.primary,
    },
  }), [theme]);

  const selectSx = useMemo(() => ({
    ...fieldSx,
    "& .MuiPaper-root": {
      backgroundColor: theme.cardBackground,
      color: theme.text,
    },
    "& .MuiMenuItem-root": {
      color: theme.text,
      backgroundColor: theme.cardBackground,
      "&:hover": {
        backgroundColor: theme.hoverBackground,
      },
      "&.Mui-selected": {
        backgroundColor: theme.primary,
        color: "#fff",
        "&:hover": {
          backgroundColor: theme.primary,
        },
      },
    },
  }), [fieldSx, theme]);

  const profitBoxSx = useMemo(() => ({
    color: theme.text,
    marginTop: 1.4,
    fontWeight: 700,
    background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.accent}15 100%)`,
    border: `2px solid ${theme.primary}40`,
    borderRadius: "12px",
    padding: "14px 16px",
    transition: "all 0.3s ease",
    fontSize: "0.95rem",
    "&:hover": {
      borderColor: theme.primary,
      background: `linear-gradient(135deg, ${theme.primary}25 0%, ${theme.accent}25 100%)`,
    },
  }), [theme]);

  const totalProfitLbp = useMemo(
    () => (sellPrice - sourcePrice) * Number(quantity || 0),
    [sellPrice, sourcePrice, quantity]
  );
  const totalProfitUsd = useMemo(
    () => totalProfitLbp / (exchangeRate > 0 ? exchangeRate : 1),
    [totalProfitLbp, exchangeRate]
  );

  const loadCustomers = async () => {
    const customersSnapshot = await getDocs(collection(db, "customers"));
    const names = customersSnapshot.docs
      .map((customerDoc) => String(customerDoc.data().displayName || ""))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    setCustomers(names);
  };

  useEffect(() => {
    const fetchSettingsAndCustomers = async () => {
      try {
        const [providersSnapshot, categoriesSnapshot, settingsSnapshot] = await Promise.all([
          getDocs(collection(db, "catalog_providers")),
          getDocs(collection(db, "catalog_categories")),
          getDoc(doc(db, "settings", "system")),
        ]);
        setProviders(
          providersSnapshot.docs
            .filter((providerDoc) => providerDoc.data().isActive !== false)
            .map((providerDoc) => providerDoc.id)
        );
        setCategories(
          categoriesSnapshot.docs
            .filter((categoryDoc) => categoryDoc.data().isActive !== false)
            .map((categoryDoc) => categoryDoc.id)
        );
        if (settingsSnapshot.exists()) {
          setExchangeRate(Number(settingsSnapshot.data().exchangeRate || 1));
        }
        await loadCustomers();
      } catch (error: any) {
        console.error("Failed to load catalog/settings:", error);
        showSnackbar(
          error?.code === "permission-denied"
            ? "Your account is not allowed to access dashboard data."
            : "Failed to load settings data.",
          "error"
        );
      }
    };
    fetchSettingsAndCustomers();
  }, []);

  useEffect(() => {
    if (!selectedProvider || !selectedCategory) {
      setItems([]);
      setSelectedItem("");
      return;
    }

    const fetchItems = async () => {
      const itemsSnapshot = await getDocs(
        query(
          collection(db, "catalog_products"),
          where("providerId", "==", selectedProvider),
          where("categoryId", "==", selectedCategory)
        )
      );
      const itemList = itemsSnapshot.docs
        .map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() }))
        .filter((item: any) => item.isActive !== false)
        .sort(
          (a: any, b: any) => Number(a?.prices?.source || 0) - Number(b?.prices?.source || 0)
        );
      setItems(itemList);
    };

    fetchItems();
  }, [selectedProvider, selectedCategory]);

  useEffect(() => {
    if (
      !selectedItem ||
      selectedItem === NEW_PRODUCT_VALUE ||
      !selectedProvider ||
      !selectedCategory
    ) {
      return;
    }

    const fetchItemDetails = async () => {
      const itemRef = doc(db, "catalog_products", selectedItem);
      const itemDoc = await getDoc(itemRef);
      if (!itemDoc.exists()) {
        return;
      }
      const itemData = itemDoc.data();
      const fetchedSourcePrice = Number(itemData.prices?.source || 0);
      const fetchedRetailPrice = Number(itemData.prices?.retail || 0);
      const fetchedWholesalePrice = Number(itemData.prices?.wholesale || 0);
      setSourcePrice(fetchedSourcePrice);
      setRetailPrice(fetchedRetailPrice);
      setWholesalePrice(fetchedWholesalePrice);
      setSellPrice(priceType === "retail" ? fetchedRetailPrice : fetchedWholesalePrice);
    };

    fetchItemDetails();
  }, [selectedItem, priceType, selectedProvider, selectedCategory]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleApplyLastInput = () => {
    const raw = localStorage.getItem(LAST_INPUT_KEY);
    if (!raw) {
      showSnackbar("No saved input found yet.", "error");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as LastInput;
      setCustomerName(parsed.customerName || "");
      setSelectedProvider(parsed.selectedProvider || "");
      setSelectedCategory(parsed.selectedCategory || "");
      setSelectedItem(parsed.selectedItem || "");
      setNewProductName(parsed.newProductName || "");
      setPriceType(parsed.priceType || "retail");
      setSourcePrice(Number(parsed.sourcePrice || 0));
      setSellPrice(Number(parsed.sellPrice || 0));
      setQuantity(Math.max(1, Number(parsed.quantity || 1)));
      showSnackbar("Last input reapplied.", "success");
    } catch {
      showSnackbar("Saved last input is invalid.", "error");
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setSelectedProvider("");
    setSelectedCategory("");
    setItems([]);
    setSelectedItem("");
    setNewProductName("");
    setSellPrice(0);
    setSourcePrice(0);
    setRetailPrice(0);
    setWholesalePrice(0);
    setPriceType("retail");
    setQuantity(1);
    setTransactionDate(DateTime.now().setZone("UTC+2").toFormat("yyyy-LL-dd'T'HH:mm"));
  };

  const isFormValid = () => {
    const itemName =
      selectedItem === NEW_PRODUCT_VALUE ? newProductName.trim() : selectedItem.trim();

    return (
      customerName.trim() !== "" &&
      selectedProvider !== "" &&
      selectedCategory !== "" &&
      itemName !== "" &&
      sellPrice > 0 &&
      sourcePrice >= 0 &&
      quantity > 0 &&
      transactionDate !== ""
    );
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (isAdding || !isFormValid()) {
      return;
    }

    setIsAdding(true);
    const trimmedCustomerName = customerName.trim();
    const customerId = toCustomerId(trimmedCustomerName);
    const monthKey = toMonthKey(transactionDate);
    const itemName =
      selectedItem === NEW_PRODUCT_VALUE ? newProductName.trim() : selectedItem.trim();
    const quantityValue = Math.max(1, Number(quantity || 1));
    const unitProfitLbp = Number(sellPrice) - Number(sourcePrice);
    const revenueLbp = unitProfitLbp * quantityValue;
    const rate = exchangeRate > 0 ? exchangeRate : 1;
    const revenueUsd = revenueLbp / rate;
    const dateMs = new Date(transactionDate).getTime();
    const entryId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const entry = {
      entryId,
      customerName: trimmedCustomerName,
      customerId,
      provider: selectedProvider,
      category: selectedCategory,
      item: itemName,
      priceType,
      quantity: quantityValue,
      sourcePrice: Number(sourcePrice),
      sellPrice: Number(sellPrice),
      revenue: revenueLbp,
      revenueUsd,
      unitProfit: unitProfitLbp,
      unitProfitUsd: unitProfitLbp / rate,
      exchangeRate: rate,
      dateMs,
      createdAtMs: Date.now(),
    };

    try {
      if (selectedItem === NEW_PRODUCT_VALUE) {
        const productId = toCustomerId(`${selectedProvider}-${selectedCategory}-${itemName}`);
        await setDoc(
          doc(db, "catalog_products", productId),
          {
            name: itemName,
            providerId: selectedProvider,
            categoryId: selectedCategory,
            prices: {
              source: Number(sourcePrice),
              retail: Number(retailPrice || sellPrice),
              wholesale: Number(wholesalePrice || sellPrice),
            },
            isActive: true,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      await setDoc(
        doc(db, "customers", customerId),
        {
          displayName: trimmedCustomerName,
          normalizedName: trimmedCustomerName.toLowerCase(),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      const monthRef = doc(db, "customers", customerId, "months", monthKey);
      const monthSnap = await getDoc(monthRef);
      const existingEntries = monthSnap.exists()
        ? Array.isArray(monthSnap.data().entries)
          ? monthSnap.data().entries
          : []
        : [];
      const mergedEntries = [...existingEntries, entry];
      const totals = computeTotals(mergedEntries);

      if (monthSnap.exists()) {
        await updateDoc(monthRef, {
          entries: mergedEntries,
          totals,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(monthRef, {
          customerId,
          customerName: trimmedCustomerName,
          monthKey,
          entries: mergedEntries,
          totals,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      localStorage.setItem(
        LAST_INPUT_KEY,
        JSON.stringify({
          customerName: trimmedCustomerName,
          selectedProvider,
          selectedCategory,
          selectedItem,
          newProductName,
          priceType,
          sourcePrice: Number(sourcePrice),
          sellPrice: Number(sellPrice),
          quantity: quantityValue,
        } as LastInput)
      );

      await loadCustomers();
      await fetchTransactions();
      showSnackbar("Transaction saved successfully.", "success");
      resetForm();
    } catch (error) {
      console.error("Error adding transaction:", error);
      showSnackbar("Failed to add transaction.", "error");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Box
      sx={{
        padding: isMobile ? "1.2rem 1rem" : "1.6rem 1.4rem",
        background: `linear-gradient(145deg, ${theme.cardBackground} 0%, ${theme.backgroundLight} 100%)`,
        border: `1px solid ${theme.borderColor}30`,
        borderRadius: "16px",
        boxShadow: `0px 14px 32px ${theme.shadow}15`,
        backdropFilter: "blur(8px)",
        height: "100%",
        transition: "all 0.3s ease",
      }}
    >
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ color: theme.text, fontWeight: 700, fontSize: "1.08rem" }}>
          Sales Entry
        </Typography>
        <Button
          onClick={handleApplyLastInput}
          size="small"
          padding="8px 10px"
          fontSize="0.8rem"
          borderRadius="8px"
          margin="0"
        >
          Re-apply Last Input
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        <Autocomplete
          freeSolo
          options={customers}
          value={customerName}
          onInputChange={(_, value) => setCustomerName(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Customer"
              required
              size="small"
              margin="normal"
              fullWidth
              sx={fieldSx}
            />
          )}
        />

        <FormControl fullWidth size="small" required margin="normal" sx={selectSx}>
          <InputLabel>Provider</InputLabel>
          <Select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as string)}
            label="Provider"
          >
            {providers.map((provider) => (
              <MenuItem key={provider} value={provider}>
                {provider}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" required margin="normal" sx={selectSx}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as string)}
            label="Category"
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" required margin="normal" sx={selectSx}>
          <InputLabel>Product</InputLabel>
          <Select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value as string)}
            label="Product"
          >
            {items.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name || item.id}
              </MenuItem>
            ))}
            <MenuItem value={NEW_PRODUCT_VALUE}>+ Add New Product</MenuItem>
          </Select>
        </FormControl>

        {selectedItem === NEW_PRODUCT_VALUE && (
          <>
            <TextField
              label="New Product Name"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              required
              size="small"
              margin="normal"
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="Retail Price"
              type="number"
              value={retailPrice}
              onChange={(e) => setRetailPrice(Number(e.target.value))}
              size="small"
              margin="normal"
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="Wholesale Price"
              type="number"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(Number(e.target.value))}
              size="small"
              margin="normal"
              fullWidth
              sx={fieldSx}
            />
          </>
        )}

        <TextField
          label="Transaction Date"
          type="datetime-local"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
          size="small"
          margin="normal"
          fullWidth
          sx={fieldSx}
        />

        <FormControl fullWidth size="small" required margin="normal" sx={selectSx}>
          <InputLabel>Price Type</InputLabel>
          <Select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value as "retail" | "wholesale")}
            label="Price Type"
          >
            <MenuItem value="retail">Retail</MenuItem>
            <MenuItem value="wholesale">Wholesale</MenuItem>
          </Select>
        </FormControl>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 1.25,
            mt: 0.6,
          }}
        >
          <TextField
            label="Source Price"
            type="number"
            value={sourcePrice}
            onChange={(e) => setSourcePrice(Number(e.target.value))}
            required
            size="small"
            margin="normal"
            fullWidth
            sx={fieldSx}
          />

          <TextField
            label="Sell Price"
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(Number(e.target.value))}
            required
            size="small"
            margin="normal"
            fullWidth
            sx={fieldSx}
          />

          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
            required
            size="small"
            margin="normal"
            fullWidth
            inputProps={{ min: 1 }}
            sx={fieldSx}
          />
        </Box>

        <Typography
          sx={profitBoxSx}
        >
          Estimated Profit: {totalProfitLbp.toFixed(0)} LBP ({totalProfitUsd.toFixed(2)} USD)
        </Typography>

        <Button
          onClick={(e) => handleSubmit(e)}
          disabled={isAdding || !isFormValid()}
          size="large"
          padding="13px"
          fontSize="0.95rem"
          borderRadius="12px"
          width="100%"
          margin="16px 0 0 0"
        >
          {isAdding ? "Saving..." : "Save Sale"}
        </Button>
      </form>
    </Box>
  );
};

export default TransactionForm;
