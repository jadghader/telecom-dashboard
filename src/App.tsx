import React from "react";
import { ThemeProvider } from "styled-components";
import GlobalStyles from "./styles/GlobalStyles";
import { lightTheme, darkTheme } from "./styles/theme";
import Loader from "./components/styled-components/Loader";
import { useAuth } from "./context/AuthContext";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import useThemeDetect from "./hooks/useThemeDetect";

const App: React.FC = () => {
  const { isDarkMode } = useThemeDetect();
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) return <Loader />;

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyles />
      {user ? (
        <Dashboard />
      ) : (
        <Login />
      )}
    </ThemeProvider>
  );
};

export default App;
