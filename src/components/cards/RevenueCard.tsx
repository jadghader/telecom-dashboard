import React, { useState, useEffect } from "react";
import { Typography, Card, CardContent, Box } from "@mui/material";
import { useTheme } from "styled-components";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { motion } from "framer-motion";

// Easing function for a smooth transition
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface Transaction {
  revenue: number;
}

interface RevenueSummaryProps {
  transactions: Transaction[];
  currency: "USD" | "LBP";
  exchangeRate: number;
}

const RevenueSummary: React.FC<RevenueSummaryProps> = ({
  transactions,
  currency,
  exchangeRate,
}) => {
  const theme = useTheme();
  const [animatedRevenue, setAnimatedRevenue] = useState(0);

  // Calculate total revenue
  const totalRevenue = transactions.reduce((sum, transaction) => {
    const safeRate = exchangeRate > 0 ? exchangeRate : 1;
    if (currency === "USD") {
      return sum + transaction.revenue / safeRate;
    }
    return sum + transaction.revenue;
  }, 0);

  // Animate revenue number
  useEffect(() => {
    let start = 0;
    const end = totalRevenue;
    const duration = 2000; // Total animation duration in ms
    const startTime = performance.now(); // Capture the starting time

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1); // Progress as a percentage of total time

      setAnimatedRevenue(start + (end - start) * easeOut(progress)); // Apply easing and set the current value

      if (progress < 1) {
        requestAnimationFrame(animate); // Continue the animation if not finished
      }
    };

    requestAnimationFrame(animate); // Start the animation
  }, [totalRevenue]);

  return (
    <Card
      sx={{
        borderRadius: "16px",
        border: `1px solid ${theme.borderColor}`,
        boxShadow: `0px 10px 24px ${theme.shadow}`,
        background: `linear-gradient(160deg, ${theme.cardBackground} 0%, ${theme.backgroundLight} 100%)`,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        padding: 2.5,
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0px 14px 30px ${theme.shadow}`,
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Title with Icon */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MonetizationOnIcon sx={{ color: theme.primary, fontSize: 34 }} />
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.textMuted,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1.1,
            }}
          >
            Total Revenue
          </Typography>
        </Box>

        {/* Animated Revenue Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h4"
            sx={{
              color: theme.text,
              fontWeight: 700,
              marginTop: 0.5,
            }}
          >
            {currency === "USD"
              ? `$${animatedRevenue.toFixed(2)}`
              : `${animatedRevenue.toFixed(0)} LBP`}
          </Typography>
        </motion.div>

        {/* Currency Info */}
        <Typography
          variant="body2"
          sx={{
            color: theme.text,
            marginTop: 1.6,
          }}
        >
          Displayed in {currency}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RevenueSummary;
