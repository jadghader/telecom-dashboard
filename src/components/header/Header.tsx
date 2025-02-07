import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { FaCog, FaTimes } from "react-icons/fa";
import { doc, getDoc, updateDoc, getFirestore } from "firebase/firestore";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GlobalStyle = createGlobalStyle<{ overlayVisible: boolean }>`
  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    ${({ overlayVisible }) => overlayVisible && "overflow: hidden;"}
  }
`;

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  font-size: 1.5rem;
  transition: 0.3s;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const Overlay = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ visible }) => (visible ? "flex" : "none")};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const SettingsContainer = styled.div`
  width: 90%;
  max-width: 420px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  position: absolute;
  top: 12px;
  right: 12px;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const ExchangeContainer = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: ${({ theme }) => theme.backgroundLight};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CurrentRate = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 12px;
`;

const Input = styled.input`
  padding: 12px;
  font-size: 1rem;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  outline: none;
  transition: 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 8px ${({ theme }) => theme.primary};
  }
`;

const Button = styled.button`
  padding: 12px;
  width: 100%;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: 0.3s;
  margin-top: 12px;
  font-size: 1rem;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
`;

const Header: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const db = getFirestore();
  const [showSettings, setShowSettings] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [newRate, setNewRate] = useState<string>("");

  useEffect(() => {
    const fetchExchangeRate = async () => {
      const docRef = doc(db, "settings", "exchange_rate");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setExchangeRate(docSnap.data().usd_to_lbp);
      }
    };

    if (showSettings) fetchExchangeRate();
  }, [showSettings, db]);

  const updateExchangeRate = async () => {
    if (!newRate) return;
    try {
      await updateDoc(doc(db, "settings", "exchange_rate"), {
        usd_to_lbp: parseFloat(newRate),
      });
      setExchangeRate(parseFloat(newRate));
      alert("Exchange rate updated!");
    } catch (error) {
      console.error("Error updating exchange rate:", error);
      alert("Failed to update exchange rate.");
    }
  };

  return (
    <>
      <GlobalStyle overlayVisible={showSettings} />
      <HeaderContainer>
        <Title>Telecom Dashboard</Title>
        <IconButton onClick={() => setShowSettings(true)}>
          <FaCog />
        </IconButton>
      </HeaderContainer>

      <Overlay visible={showSettings}>
        <SettingsContainer>
          <CloseButton onClick={() => setShowSettings(false)}>
            <FaTimes />
          </CloseButton>
          <h2>Settings</h2>

          <ExchangeContainer>
            <CurrentRate>
              Current Rate:{" "}
              {exchangeRate ? exchangeRate.toFixed(0) : "Loading..."} LBP
            </CurrentRate>
            <Input
              type="number"
              placeholder="Enter new rate"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
            />
            <Button onClick={updateExchangeRate}>Update Rate</Button>
          </ExchangeContainer>
        </SettingsContainer>
      </Overlay>
    </>
  );
};

export default Header;
