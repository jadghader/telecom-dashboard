import React from "react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GlobalStyles from "./styles/GlobalStyles";
import { lightTheme, darkTheme } from "./styles/theme";
import NotFound from "./components/404/NotFound";
import Loader from "./components/styled-components/Loader";
import { useAuth } from "./context/AuthContext";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import useThemeDetect from "./hooks/useThemeDetect";

const App: React.FC = () => {
  const { theme, isDarkMode } = useThemeDetect(); // Use both theme and isDarkMode
  const { isLoading: authLoading } = useAuth();

  if (authLoading) return <Loader />;

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyles />
      <Router>
        <AppContent isDarkMode={isDarkMode} />
      </Router>
    </ThemeProvider>
  );
};

const AppContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoutes />}>
          <Route
            path="/dashboard"
            element={<Dashboard isDarkMode={isDarkMode} />}
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;

