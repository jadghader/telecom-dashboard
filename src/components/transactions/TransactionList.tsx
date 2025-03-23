import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Box,
  IconButton,
  TableSortLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useTheme } from "styled-components";
import { toZonedTime, format as tzFormat } from "date-fns-tz";

interface Transaction {
  id: string;
  customerName: string;
  provider: string;
  category: string;
  item: string;
  sourcePrice: number;
  sellPrice: number;
  revenue: number;
  date: any;
}

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const theme = useTheme();

  const [currentTransactions, setCurrentTransactions] =
    useState<Transaction[]>(transactions);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Transaction | "date">("date");

  useEffect(() => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => b.date.seconds - a.date.seconds
    );
    setCurrentTransactions(sortedTransactions);
  }, [transactions]);

  const handleDelete = async (id: string) => {
    try {
      const transactionDoc = doc(db, "transactions", id);
      await deleteDoc(transactionDoc);
      setCurrentTransactions(currentTransactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction: ", error);
    }
  };

  const handleSort = (property: keyof Transaction) => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
    const sortedData = [...currentTransactions].sort((a, b) => {
      if (property === "date") {
        return isAscending
          ? a.date.seconds - b.date.seconds
          : b.date.seconds - a.date.seconds;
      }
      if (a[property] < b[property]) return isAscending ? 1 : -1;
      if (a[property] > b[property]) return isAscending ? -1 : 1;
      return 0;
    });
    setCurrentTransactions(sortedData);
  };

  const formatDate = (timestamp: any) => {
    const timeZone = "Asia/Beirut";
    const date = timestamp?.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date();
    const zonedDate = toZonedTime(date, timeZone);
    return tzFormat(zonedDate, "d MMMM yyyy 'at' HH:mm:ss", {
      timeZone,
    });
  };

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Typography
        variant="h6"
        sx={{ marginBottom: 2, fontWeight: 600, color: theme.text }}
      >
        Transaction History
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: `0px 4px 8px ${theme.shadow}`,
          background: theme.cardBackground,
          overflowX: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.primary }}>
              {[
                { label: "Customer", key: "customerName" },
                { label: "Provider", key: "provider" },
                { label: "Category", key: "category" },
                { label: "Item", key: "item" },
                { label: "Source Price", key: "sourcePrice" },
                { label: "Sell Price", key: "sellPrice" },
                { label: "Revenue", key: "revenue" },
                { label: "Date", key: "date" },
              ].map(({ label, key }) => (
                <TableCell key={key} sx={{ color: "white", fontWeight: 600 }}>
                  <TableSortLabel
                    active={orderBy === key}
                    direction={orderBy === key ? order : "asc"}
                    onClick={() => handleSort(key as keyof Transaction)}
                    sx={{ color: "white" }}
                  >
                    {label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell sx={{ color: "white", fontWeight: 600 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTransactions.length > 0 ? (
              currentTransactions.map((t) => (
                <TableRow
                  key={t.id}
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: theme.secondary,
                    },
                    "&:hover": {
                      backgroundColor: theme.hoverBackground,
                    },
                  }}
                >
                  <TableCell sx={{ color: theme.text }}>
                    {t.customerName}
                  </TableCell>
                  <TableCell sx={{ color: theme.text }}>{t.provider}</TableCell>
                  <TableCell sx={{ color: theme.text }}>{t.category}</TableCell>
                  <TableCell sx={{ color: theme.text }}>{t.item}</TableCell>
                  <TableCell sx={{ color: theme.text }}>
                    {t.sourcePrice.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: theme.text }}>
                    {t.sellPrice.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: theme.success, fontWeight: 600 }}>
                    {t.revenue.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: theme.text }}>
                    {formatDate(t.date)}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleDelete(t.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{ color: theme.text }}
                >
                  No transactions available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TransactionList;
