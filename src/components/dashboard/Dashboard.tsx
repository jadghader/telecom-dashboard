import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { MenuItem, Select, FormControl, useMediaQuery } from "@mui/material";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import RevenueSummary from "../cards/RevenueCard";
import TransactionForm from "../transactions/TransactionForm";
import TransactionList from "../transactions/TransactionList";
import Header from "../header/Header";

const DashboardContainer = styled.div<{ isMobile: boolean }>`
  padding: ${({ isMobile }) => (isMobile ? "16px" : "24px")};
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SummaryAndFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 24px;
  }
`;

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
`;

const FormContainer = styled.div`
  flex: 1;
  align-items: stretch;
`;

const StyledInputLabel = styled.label<{ theme: any }>`
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 8px;
  display: inline-block;
  font-weight: 600;
  transition: color 0.3s ease;

  &:focus-within {
    color: ${({ theme }) => theme.accent};
  }
`;

const StyledSelect = styled(Select)`
  & .MuiOutlinedInput-root {
    background-color: ${({ theme }) => theme.inputBackground};
    color: ${({ theme }) => theme.text};
    border-radius: 8px;

    &:hover {
      background-color: ${({ theme }) => theme.inputHover};
    }

    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: ${({ theme }) =>
        theme.accent}; /* Focused state border color */
    }
  }

  /* Targeting the <fieldset> element that contains the border */
  & .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.borderColor}; /* Normal border color */
  }

  /* Optional: to adjust the legend text color */
  & .MuiFormLabel-root {
    color: ${({ theme }) => theme.text};
  }

  .MuiMenuItem-root {
    color: ${({ theme }) => theme.text};
  }

  & .MuiSelect-select {
    color: ${({ theme }) =>
      theme.inputText}; /* Dynamic color for the selected month value */
  }
`;

const Dashboard: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "transactions"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const filteredData = data.filter((transaction: any) => {
      const transactionDate = transaction?.date.toDate();
      const transactionMonth = transactionDate.toISOString().slice(0, 7);
      return transactionMonth === selectedMonth;
    });
    setTransactions(filteredData);
  }, [selectedMonth]); // ✅ Wrapped in useCallback to avoid unnecessary re-renders

  const fetchExchangeRate = useCallback(async () => {
    const settingsRef = doc(db, "settings", "exchange_rate");
    const settingsDoc = await getDoc(settingsRef);
    if (settingsDoc.exists()) {
      setExchangeRate(settingsDoc.data().usd_to_lbp);
    }
  }, []); // No dependencies since it doesn't rely on external state

  // Handle disabling scrolling when Select dropdown is open
  useEffect(() => {
    if (isSelectOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSelectOpen]);

  useEffect(() => {
    fetchTransactions();
    fetchExchangeRate();
  }, [fetchTransactions, fetchExchangeRate]); // ✅ Now properly listed in dependencies

  return (
    <>
      <Header isDarkMode={isDarkMode} />
      <DashboardContainer isMobile={isMobile}>
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

          <FormControl fullWidth>
            {/* Use the custom styled InputLabel */}
            <StyledInputLabel theme={{ text: isDarkMode ? "#fff" : "#000" }}>
              Month
            </StyledInputLabel>
            <StyledSelect
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value as string)}
              label="Month"
              open={isSelectOpen}
              onOpen={() => setIsSelectOpen(true)}
              onClose={() => setIsSelectOpen(false)}
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
            </StyledSelect>
          </FormControl>

          <TransactionList transactions={transactions} />
        </ContentWrapper>
      </DashboardContainer>
    </>
  );
};

export default Dashboard;
