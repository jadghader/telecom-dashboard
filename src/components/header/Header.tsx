import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { FaCog, FaSignOutAlt, FaTimes } from "react-icons/fa";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  getFirestore,
} from "firebase/firestore";
import { Alert, Snackbar } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_EXCHANGE_RATE = 89500;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const OverlayLock = createGlobalStyle<{ overlayVisible: boolean }>`
  body {
    ${({ overlayVisible }) => (overlayVisible ? "overflow: hidden;" : "")}
  }
`;

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 14px 16px 14px 18px;
  border: 1px solid color-mix(in srgb, ${({ theme }) => theme.borderColor} 75%, #ffffff 25%);
  border-radius: 18px;
  background: linear-gradient(
    122deg,
    ${({ theme }) => theme.backgroundElevated} 0%,
    ${({ theme }) => theme.cardBackground} 48%,
    ${({ theme }) => theme.backgroundLight} 100%
  );
  box-shadow: 0 14px 30px ${({ theme }) => theme.shadow};
  backdrop-filter: blur(12px);

  @media (max-width: 620px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const BrandBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const Eyebrow = styled.span`
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: ${({ theme }) => theme.textMuted};
  font-weight: 800;
`;

const Title = styled.h1`
  font-size: clamp(1.12rem, 1.6vw, 1.55rem);
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  line-height: 1.15;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SettingsButton = styled.button`
  height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.inputBackground} 0%,
    ${({ theme }) => theme.backgroundLight} 100%
  );
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  font-size: 0.88rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;

  &:hover {
    transform: translateY(-1px) scale(1.01);
    background: ${({ theme }) => theme.hoverBackground};
  }
`;

const LogoutButton = styled.button`
  height: 42px;
  padding: 0 15px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.primary};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.inputBackground} 0%,
    ${({ theme }) => theme.backgroundLight} 100%
  );
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
  font-size: 0.88rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;

  &:hover {
    transform: translateY(-1px) scale(1.01);
    background: ${({ theme }) => theme.primary};
    color: #fff;
  }
`;

const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(11, 17, 27, 0.56);
  display: ${({ $visible }) => ($visible ? "grid" : "none")};
  place-items: center;
  z-index: 1000;
  padding: 16px;
`;

const SettingsContainer = styled.div`
  width: min(560px, 100%);
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  padding: 30px;
  padding-top: 34px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: 0 24px 40px ${({ theme }) => theme.shadow};
  position: relative;
  animation: ${fadeIn} 0.24s ease-out;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
`;

const CloseButton = styled.button`
  background: ${({ theme }) => theme.secondary};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  transition: transform 0.2s ease, background-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: ${({ theme }) => theme.hoverBackground};
  }
`;

const Heading = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 6px;
`;

const Subtext = styled.p`
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.95rem;
  margin-bottom: 22px;
`;

const ExchangeContainer = styled.div`
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 12px;
  background: ${({ theme }) => theme.backgroundLight};
`;

const ProductSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 12px;
  background: ${({ theme }) => theme.backgroundLight};
`;

const SectionTitle = styled.h3`
  font-size: 1.02rem;
  margin-bottom: 10px;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const SelectInput = styled.select`
  padding: 10px 40px 10px 12px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 10px;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.inputText};
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%236b7280' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: 18px;
  background-position: right 12px center;
  line-height: 1.2;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px rgba(63, 107, 91, 0.18);
  }
`;

const Row = styled.div`
  margin-top: 12px;
`;

const ProductNameRow = styled(Row)`
  margin-top: 14px;
  margin-bottom: 14px;
`;

const ActionGrid = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const CurrentRate = styled.p`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 12px;
`;

const Input = styled.input`
  padding: 12px;
  font-size: 1rem;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 10px;
  outline: none;
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.inputText};
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px rgba(63, 107, 91, 0.2);
  }
`;

const Button = styled.button`
  padding: 12px 14px;
  width: 100%;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  margin-top: 14px;
  font-size: 0.98rem;
  font-weight: 700;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
`;

const SecondaryButton = styled(Button)`
  background: ${({ theme }) => theme.secondary};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.borderColor};

  &:hover {
    background: ${({ theme }) => theme.hoverBackground};
  }
`;

const DangerButton = styled(Button)`
  background: #b42318;

  &:hover {
    background: #912018;
  }
`;

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const Header: React.FC<{ isDarkMode: boolean }> = () => {
  const db = getFirestore();
  const { logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [newRate, setNewRate] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [sourcePrice, setSourcePrice] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [isProductSaving, setIsProductSaving] = useState(false);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const [systemSnap, providersSnap, categoriesSnap, productsSnap] = await Promise.all([
          getDoc(doc(db, "settings", "system")),
          getDocs(collection(db, "catalog_providers")),
          getDocs(collection(db, "catalog_categories")),
          getDocs(collection(db, "catalog_products")),
        ]);

        if (systemSnap.exists() && Number(systemSnap.data().exchangeRate) > 0) {
          setExchangeRate(Number(systemSnap.data().exchangeRate));
        } else {
          setExchangeRate(DEFAULT_EXCHANGE_RATE);
          await setDoc(
            doc(db, "settings", "system"),
            { exchangeRate: DEFAULT_EXCHANGE_RATE },
            { merge: true }
          );
        }

        setProviders(
          providersSnap.docs
            .map((providerDoc) => ({
              id: providerDoc.id,
              name: String(providerDoc.data().name || providerDoc.id),
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setCategories(
          categoriesSnap.docs
            .map((categoryDoc) => ({
              id: categoryDoc.id,
              name: String(categoryDoc.data().name || categoryDoc.id),
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setProducts(
          productsSnap.docs
            .map((productDoc) => ({
              id: productDoc.id,
              ...productDoc.data(),
            }))
            .filter((product: any) => product.isActive !== false)
        );
      } catch (error: any) {
        console.error("Failed loading settings/catalog:", error);
        setExchangeRate(DEFAULT_EXCHANGE_RATE);
        setSnackbar({
          open: true,
          message:
            error?.code === "permission-denied"
              ? "No permission to read settings."
              : "Failed to load settings.",
          severity: "error",
        });
      }
    };

    if (showSettings) fetchSettingsData();
  }, [showSettings, db]);

  useEffect(() => {
    if (!selectedProductId) return;
    const selected = products.find((product) => product.id === selectedProductId);
    if (!selected) return;
    setProductName(String(selected.name || ""));
    setSourcePrice(String(selected.prices?.source ?? ""));
    setRetailPrice(String(selected.prices?.retail ?? ""));
    setWholesalePrice(String(selected.prices?.wholesale ?? ""));
    setSelectedProvider(String(selected.providerId || ""));
    setSelectedCategory(String(selected.categoryId || ""));
  }, [selectedProductId, products]);

  const updateExchangeRate = async () => {
    if (!newRate || Number(newRate) <= 0) {
      setSnackbar({
        open: true,
        message: "Enter a valid positive exchange rate.",
        severity: "error",
      });
      return;
    }
    try {
      await setDoc(doc(db, "settings", "system"), {
        exchangeRate: parseFloat(newRate),
      }, { merge: true });
      setExchangeRate(parseFloat(newRate));
      setSnackbar({
        open: true,
        message: "Exchange rate updated.",
        severity: "success",
      });
      setNewRate("");
    } catch (error) {
      console.error("Error updating exchange rate:", error);
      setSnackbar({
        open: true,
        message: "Failed to update exchange rate.",
        severity: "error",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to logout.",
        severity: "error",
      });
    }
  };

  const clearProductForm = () => {
    setSelectedProductId("");
    setProductName("");
    setSourcePrice("");
    setRetailPrice("");
    setWholesalePrice("");
  };

  const refreshCatalog = async () => {
    const productsSnap = await getDocs(collection(db, "catalog_products"));
    setProducts(
      productsSnap.docs
        .map((productDoc) => ({ id: productDoc.id, ...productDoc.data() }))
        .filter((product: any) => product.isActive !== false)
    );
  };

  const handleSaveProduct = async () => {
    if (!selectedProvider || !selectedCategory || !productName.trim()) {
      setSnackbar({
        open: true,
        message: "Select provider/category and enter product name.",
        severity: "error",
      });
      return;
    }

    setIsProductSaving(true);
    try {
      const productId =
        selectedProductId ||
        slugify(`${selectedProvider}-${selectedCategory}-${productName}`) ||
        `${Date.now()}`;

      await setDoc(
        doc(db, "catalog_products", productId),
        {
          id: productId,
          name: productName.trim(),
          providerId: selectedProvider,
          categoryId: selectedCategory,
          prices: {
            source: Number(sourcePrice || 0),
            retail: Number(retailPrice || 0),
            wholesale: Number(wholesalePrice || 0),
          },
          isActive: true,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        { merge: true }
      );

      setSelectedProductId(productId);
      await refreshCatalog();
      setSnackbar({
        open: true,
        message: selectedProductId ? "Product updated." : "Product added.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving product:", error);
      setSnackbar({
        open: true,
        message: "Failed to save product.",
        severity: "error",
      });
    } finally {
      setIsProductSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProductId) {
      setSnackbar({
        open: true,
        message: "Select a product to delete.",
        severity: "error",
      });
      return;
    }

    try {
      await deleteDoc(doc(db, "catalog_products", selectedProductId));
      await refreshCatalog();
      clearProductForm();
      setSnackbar({
        open: true,
        message: "Product removed.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete product.",
        severity: "error",
      });
    }
  };

  const filteredProducts = products.filter(
    (product: any) =>
      (!selectedProvider || product.providerId === selectedProvider) &&
      (!selectedCategory || product.categoryId === selectedCategory)
  );

  return (
    <>
      <OverlayLock overlayVisible={showSettings} />
      <HeaderContainer>
        <BrandBlock>
          <Eyebrow>Operations</Eyebrow>
          <Title>Telecom Revenue Console</Title>
        </BrandBlock>
        <HeaderActions>
          <SettingsButton onClick={() => setShowSettings(true)} aria-label="Open settings">
            <FaCog />
            Settings
          </SettingsButton>
          <LogoutButton onClick={handleLogout} aria-label="Logout">
            <FaSignOutAlt />
            Logout
          </LogoutButton>
        </HeaderActions>
      </HeaderContainer>

      <Overlay $visible={showSettings}>
        <SettingsContainer>
          <CloseButton onClick={() => setShowSettings(false)} aria-label="Close settings">
            <FaTimes />
          </CloseButton>
          <Heading>Settings</Heading>
          <Subtext>Update your base exchange rate used across summaries.</Subtext>

          <ExchangeContainer>
            <CurrentRate>
              Current Rate: {exchangeRate ? exchangeRate.toFixed(0) : "Loading..."} LBP
            </CurrentRate>
            <Input
              type="number"
              placeholder="Enter new rate"
              value={newRate}
              onChange={(event) => setNewRate(event.target.value)}
            />
            <Button onClick={updateExchangeRate}>Update Rate</Button>
          </ExchangeContainer>

          <ProductSection>
            <SectionTitle>Product Manager</SectionTitle>
            <Subtext style={{ marginBottom: 10 }}>
              Add, edit prices, or remove catalog products.
            </Subtext>

            <FieldGrid>
              <SelectInput
                value={selectedProvider}
                onChange={(event) => setSelectedProvider(event.target.value)}
              >
                <option value="">Select Provider</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </SelectInput>

              <SelectInput
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </SelectInput>
            </FieldGrid>

            <Row>
              <SelectInput
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
              >
                <option value="">New Product</option>
                {filteredProducts.map((product: any) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </SelectInput>
            </Row>

            <ProductNameRow>
              <Input
                type="text"
                placeholder="Product Name"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
              />
            </ProductNameRow>

            <FieldGrid>
              <Input
                type="number"
                placeholder="Source Price"
                value={sourcePrice}
                onChange={(event) => setSourcePrice(event.target.value)}
              />
              <Input
                type="number"
                placeholder="Retail Price"
                value={retailPrice}
                onChange={(event) => setRetailPrice(event.target.value)}
              />
            </FieldGrid>

            <Row>
              <Input
                type="number"
                placeholder="Wholesale Price"
                value={wholesalePrice}
                onChange={(event) => setWholesalePrice(event.target.value)}
              />
            </Row>

            <ActionGrid>
              <Button onClick={handleSaveProduct} disabled={isProductSaving}>
                {isProductSaving ? "Saving..." : selectedProductId ? "Update Product" : "Add Product"}
              </Button>
              <SecondaryButton onClick={clearProductForm}>Clear</SecondaryButton>
              <DangerButton onClick={handleDeleteProduct}>Remove</DangerButton>
            </ActionGrid>
          </ProductSection>
        </SettingsContainer>
      </Overlay>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;
