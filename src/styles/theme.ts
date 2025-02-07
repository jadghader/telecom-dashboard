// src/styles/theme.ts
export const lightTheme = {
  background: "#F9FAFB", // Slightly off-white for a softer look
  inputBackground: "#FFFFFF",
  text: "#212529",
  success: "#4CAF50",
  accent: "#3B82F6", // A vibrant blue for highlights
  hoverAccent: "#2563EB", // Darker blue for hover effects
  primary: "#1D4ED8", // Stronger primary color
  secondary: "#E5E7EB", // Light gray for contrast
  cardBackground: "#FFFFFF", // Clean white for dashboard cards
  inputText: "#374151",
  disabled: "#9CA3AF", // Muted gray for disabled elements
  borderColor: "#D1D5DB", // Subtle borders
  shadow: "rgba(0, 0, 0, 0.08)",
  editable: "#3B82F6", // Blue for editable elements
  editableText: "#1D4ED8", // Darker blue for editable text (good contrast)
};

export const darkTheme = {
  background: "#111827", // Deep dark for a sleek UI
  inputBackground: "#1F2937", // Darker gray for inputs
  text: "#E5E7EB",
  success: "#388E3C",
  accent: "#60A5FA", // A softer blue accent
  hoverAccent: "#3B82F6", // Stronger blue for hover
  primary: "#2563EB",
  secondary: "#1E293B", // Dark gray for subtle contrast
  cardBackground: "#1F2937", // Matches input background
  inputText: "#F9FAFB",
  disabled: "#4B5563", // Slightly muted gray for disabled state
  borderColor: "#374151", // Subtle dark border
  shadow: "rgba(0, 0, 0, 0.4)", // Softer shadow for dark mode
  editable: "#60A5FA", // Lighter blue for editable elements
  editableText: "#2563EB", // Slightly lighter blue for editable text
};

export type ThemeType = typeof lightTheme;
