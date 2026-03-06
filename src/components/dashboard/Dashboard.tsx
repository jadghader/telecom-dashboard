import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { FormControl, MenuItem, Select, Typography, useMediaQuery } from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import RevenueSummary from "../cards/RevenueCard";
import TransactionForm from "../transactions/TransactionForm";
import TransactionList from "../transactions/TransactionList";
import Header from "../header/Header";

const PageWrapper = styled.div<{ $isMobile: boolean }>`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ $isMobile }) => ($isMobile ? "8px 8px 16px" : "12px 12px 24px")};
`;

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: transparent;
  color: ${({ theme }) => theme.text};
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SummaryAndFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 900px) {
    flex-direction: row;
    align-items: stretch;
  }
`;

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const FormContainer = styled.div`
  flex: 1.4;
`;

const SelectBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  background: linear-gradient(
    130deg,
    ${({ theme }) => theme.cardBackground} 0%,
    ${({ theme }) => theme.backgroundLight} 100%
  );
  box-shadow: 0 10px 24px ${({ theme }) => theme.shadow};

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SelectorLabel = styled(Typography)`
  font-weight: 700 !important;
  color: ${({ theme }) => theme.text} !important;
`;

export interface DashboardTransaction {
  id: string;
  entryId: string;
  customerId: string;
  monthKey: string;
  customerName: string;
  provider: string;
  category: string;
  item: string;
  quantity: number;
  sourcePrice: number;
  sellPrice: number;
  revenue: number;
  dateMs: number;
}

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

const Dashboard: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  const fetchTransactions = useCallback(async () => {
    const normalized: DashboardTransaction[] = [];
    const customersSnapshot = await getDocs(collection(db, "customers"));

    await Promise.all(
      customersSnapshot.docs.map(async (customerDoc) => {
        const monthRef = doc(db, "customers", customerDoc.id, "months", selectedMonth);
        const monthSnap = await getDoc(monthRef);
        if (!monthSnap.exists()) {
          return;
        }

        const monthData = monthSnap.data();
        const customerId = String(monthData.customerId || customerDoc.id || "");
        const monthKey = String(monthData.monthKey || selectedMonth);
        const entries = Array.isArray(monthData.entries) ? monthData.entries : [];

        entries.forEach((entry: any) => {
          normalized.push({
            id: `${customerId}-${monthKey}-${entry.entryId}`,
            entryId: String(entry.entryId),
            customerId,
            monthKey,
            customerName: String(entry.customerName || monthData.customerName || "Unknown"),
            provider: String(entry.provider || ""),
            category: String(entry.category || ""),
            item: String(entry.item || ""),
            quantity: Number(entry.quantity || 1),
            sourcePrice: Number(entry.sourcePrice || 0),
            sellPrice: Number(entry.sellPrice || 0),
            revenue: Number(entry.revenue || 0),
            dateMs: Number(entry.dateMs || 0),
          });
        });
      })
    );

    normalized.sort((a, b) => b.dateMs - a.dateMs);
    setTransactions(normalized);
  }, [selectedMonth]);

  const fetchExchangeRate = useCallback(async () => {
    const settingsRef = doc(db, "settings", "system");
    const settingsDoc = await getDoc(settingsRef);
    if (settingsDoc.exists()) {
      setExchangeRate(Number(settingsDoc.data().exchangeRate || 1));
    }
  }, []);

  const handleDeleteTransaction = useCallback(
    async (target: DashboardTransaction) => {
      const monthRef = doc(db, "customers", target.customerId, "months", target.monthKey);
      const monthSnap = await getDoc(monthRef);
      if (!monthSnap.exists()) {
        return;
      }

      const currentEntries = Array.isArray(monthSnap.data().entries)
        ? monthSnap.data().entries
        : [];
      const filteredEntries = currentEntries.filter(
        (entry: any) => String(entry.entryId) !== target.entryId
      );
      const totals = computeTotals(filteredEntries);
      await updateDoc(monthRef, {
        entries: filteredEntries,
        totals,
        updatedAt: serverTimestamp(),
      });

      await fetchTransactions();
    },
    [fetchTransactions]
  );

  useEffect(() => {
    fetchTransactions();
    fetchExchangeRate();
  }, [fetchTransactions, fetchExchangeRate]);

  return (
    <PageWrapper $isMobile={isMobile}>
      <Header isDarkMode={isDarkMode} />
      <DashboardContainer>
        <ContentWrapper>
          <SummaryAndFormContainer>
            <SummaryContainer>
              <RevenueSummary
                transactions={transactions}
                currency="LBP"
                exchangeRate={exchangeRate}
              />
              <RevenueSummary
                transactions={transactions}
                currency="USD"
                exchangeRate={exchangeRate}
              />
            </SummaryContainer>

            <FormContainer>
              <TransactionForm fetchTransactions={fetchTransactions} />
            </FormContainer>
          </SummaryAndFormContainer>

          <SelectBlock>
            <SelectorLabel variant="subtitle1">Reporting Month</SelectorLabel>
            <FormControl fullWidth sx={{ maxWidth: 280 }}>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value as string)}
                size="small"
                sx={{
                  borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.65)",
                }}
              >
                {Array.from({ length: 12 }).map((_, index) => {
                  const month = new Date();
                  month.setMonth(month.getMonth() - index);
                  const monthString = month.toISOString().slice(0, 7);
                  return (
                    <MenuItem key={monthString} value={monthString}>
                      {month.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </SelectBlock>

          <TransactionList
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </ContentWrapper>
      </DashboardContainer>
    </PageWrapper>
  );
};

export default Dashboard;
