import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "styled-components";
import { DashboardTransaction } from "../dashboard/Dashboard";

interface TransactionListProps {
  transactions: DashboardTransaction[];
  onDeleteTransaction: (transaction: DashboardTransaction) => Promise<void>;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
}) => {
  const theme = useTheme();
  const [currentTransactions, setCurrentTransactions] =
    useState<DashboardTransaction[]>(transactions);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<keyof DashboardTransaction>("dateMs");

  useEffect(() => {
    const sorted = [...transactions].sort((a, b) => b.dateMs - a.dateMs);
    setCurrentTransactions(sorted);
  }, [transactions]);

  const handleSort = (property: keyof DashboardTransaction) => {
    const ascending = orderBy === property && order === "asc";
    setOrder(ascending ? "desc" : "asc");
    setOrderBy(property);
    const sorted = [...currentTransactions].sort((a, b) => {
      const aValue = a[property];
      const bValue = b[property];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return ascending ? bValue - aValue : aValue - bValue;
      }
      return ascending
        ? String(bValue).localeCompare(String(aValue))
        : String(aValue).localeCompare(String(bValue));
    });
    setCurrentTransactions(sorted);
  };

  const formatDate = (dateMs: number) => {
    if (!dateMs) {
      return "-";
    }
    return new Date(dateMs).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Typography
        variant="h6"
        sx={{ marginBottom: 1.2, fontWeight: 700, color: theme.text, letterSpacing: "-0.01em" }}
      >
        Transaction History
      </Typography>
      <Typography sx={{ marginBottom: 2, color: theme.textMuted, fontSize: "0.92rem" }}>
        Latest customer activity for the selected month.
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "16px",
          border: `1px solid ${theme.borderColor}30`,
          boxShadow: `0px 14px 32px ${theme.shadow}15`,
          background: `linear-gradient(185deg, ${theme.cardBackground} 0%, ${theme.backgroundLight} 100%)`,
          backdropFilter: "blur(8px)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: `0px 18px 40px ${theme.shadow}20`,
          },
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
              }}
            >
              {[
                { label: "Customer", key: "customerName" },
                { label: "Provider", key: "provider" },
                { label: "Category", key: "category" },
                { label: "Item", key: "item" },
                { label: "Qty", key: "quantity" },
                { label: "Unit Cost", key: "sourcePrice" },
                { label: "Unit Sell", key: "sellPrice" },
                { label: "Profit (LBP)", key: "revenue" },
                { label: "Date", key: "dateMs" },
              ].map(({ label, key }) => (
                <TableCell key={key} sx={{ color: "white", fontWeight: 700, py: 1.2 }}>
                  <TableSortLabel
                    active={orderBy === key}
                    direction={orderBy === key ? order : "asc"}
                    onClick={() => handleSort(key as keyof DashboardTransaction)}
                    sx={{ color: "white" }}
                  >
                    {label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell sx={{ color: "white", fontWeight: 700 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTransactions.length > 0 ? (
              currentTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  sx={{
                    "&:nth-of-type(even)": { backgroundColor: theme.secondary },
                    "&:hover": { backgroundColor: theme.hoverBackground, transition: "0.2s" },
                  }}
                >
                  <TableCell sx={{ color: theme.text }}>{transaction.customerName}</TableCell>
                  <TableCell sx={{ color: theme.text }}>{transaction.provider}</TableCell>
                  <TableCell sx={{ color: theme.text }}>{transaction.category}</TableCell>
                  <TableCell sx={{ color: theme.text }}>{transaction.item}</TableCell>
                  <TableCell sx={{ color: theme.text, fontWeight: 600 }}>
                    {transaction.quantity}
                  </TableCell>
                  <TableCell sx={{ color: theme.text }}>
                    {transaction.sourcePrice.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: theme.text }}>
                    {transaction.sellPrice.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: theme.success, fontWeight: 700 }}>
                    {Math.round(transaction.revenue).toLocaleString()} LBP
                  </TableCell>
                  <TableCell sx={{ color: theme.text }}>{formatDate(transaction.dateMs)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => onDeleteTransaction(transaction)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ color: theme.text }}>
                  No transactions available for this month.
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
