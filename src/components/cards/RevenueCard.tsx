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
        border: `1px solid ${theme.borderColor}30`,
        boxShadow: `0px 14px 32px ${theme.shadow}15`,
        background: `linear-gradient(135deg, ${theme.cardBackground} 0%, ${theme.backgroundLight} 100%)`,
        backdropFilter: "blur(8px)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        padding: 3,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: "''",
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.05), transparent 50%)",
          pointerEvents: "none",
        },
        "&:hover": {
          transform: "translateY(-6px) scale(1.02)",
          boxShadow: `0px 20px 48px ${theme.shadow}25`,
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Title with Icon */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <MonetizationOnIcon sx={{ color: theme.primary, fontSize: 36 }} />
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.textMuted,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              fontSize: "0.8rem",
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
              fontWeight: 800,
              marginTop: 1.2,
              fontSize: "clamp(1.5rem, 2vw, 2rem)",
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
            color: theme.textMuted,
            marginTop: 1.8,
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          Displayed in {currency}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RevenueSummary;
