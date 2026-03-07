import { useState, useEffect } from "react";
import { lightTheme, darkTheme } from "../styles/theme"; // Import your themes

const useThemeDetect = () => {
  const [theme, setTheme] = useState(lightTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem("theme");

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
      localStorage.setItem("theme", systemTheme);
    }

    // Function to handle system theme changes dynamically
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      const themeToSet = newTheme === "dark" ? darkTheme : lightTheme;
      setTheme(themeToSet);
      setIsDarkMode(newTheme === "dark");
      localStorage.setItem("theme", newTheme);
    };

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    // Clean up the event listener on unmount
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      const themeToSet = newMode ? darkTheme : lightTheme;
      setTheme(themeToSet);
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  return { theme, isDarkMode, toggleTheme };
};

export default useThemeDetect;
