import { useState, useEffect } from "react";
import { lightTheme, darkTheme } from "../styles/theme"; // Import your themes

const useThemeDetect = () => {
  const [theme, setTheme] = useState(lightTheme); // Default theme to lightTheme
  const [isDarkMode, setIsDarkMode] = useState(false); // Track dark mode status

  useEffect(() => {
    // Check for saved theme in session storage or system preference
    const savedTheme = sessionStorage.getItem("theme");

    if (savedTheme) {
      // If a saved theme exists, use it
      const themeToSet = savedTheme === "dark" ? darkTheme : lightTheme;
      setTheme(themeToSet);
      setIsDarkMode(savedTheme === "dark");
    } else {
      // If no saved theme exists, detect system theme preference
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      const themeToSet = systemTheme === "dark" ? darkTheme : lightTheme;
      setTheme(themeToSet);
      setIsDarkMode(systemTheme === "dark");
      sessionStorage.setItem("theme", systemTheme); // Save to sessionStorage
    }

    // Function to handle system theme changes dynamically
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      const themeToSet = newTheme === "dark" ? darkTheme : lightTheme;
      setTheme(themeToSet);
      setIsDarkMode(newTheme === "dark");
      sessionStorage.setItem("theme", newTheme); // Save the new theme to sessionStorage
    };

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    // Clean up the event listener on unmount
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  return { theme, isDarkMode }; // Return both theme and isDarkMode
};

export default useThemeDetect;
