import React from "react";
import styled from "styled-components";

interface ButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: "small" | "medium" | "large";
  fontSize?: string;
  padding?: string;
  borderRadius?: string;
  width?: string; // Custom width
  height?: string; // Custom height
  margin?: string; // Custom margin
  disabled?: boolean; // Disabled state
  sx?: React.CSSProperties; // Extra styling
}

const ButtonContainer = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ width }) => width || "auto"};
  height: ${({ height }) => height || "auto"};
  margin: ${({ margin }) => margin || "0"};
  padding: ${({ padding, size }) => {
    if (padding) return padding;
    switch (size) {
      case "small":
        return "8px 16px";
      case "large":
        return "16px 32px";
      case "medium":
      default:
        return "12px 24px";
    }
  }};
  font-size: ${({ fontSize, size }) => {
    if (fontSize) return fontSize;
    switch (size) {
      case "small":
        return "14px";
      case "large":
        return "18px";
      case "medium":
      default:
        return "16px";
    }
  }};
  font-weight: 600;
  border: none;
  border-radius: ${({ borderRadius }) => borderRadius || "8px"};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  background-color: ${({ theme, disabled }) =>
    disabled ? "gray" : theme.primary};
  color: ${({ disabled }) => (disabled ? "#ccc" : "#FFFFFF")};
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: ${({ theme, disabled }) =>
      disabled ? "gray" : theme.accent};
    transform: ${({ disabled }) => (disabled ? "none" : "scale(1.01)")};
  }

  &:focus {
    outline: none;
  }

  svg {
    margin-right: 8px;
  }
`;

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  icon,
  size = "medium",
  fontSize,
  padding,
  borderRadius,
  width,
  height,
  margin,
  disabled = false,
  sx = {},
}) => {
  // Use a no-op function if disabled
  const handleClick = disabled ? () => {} : onClick;

  return (
    <ButtonContainer
      onClick={handleClick} // Prevent click when disabled
      size={size}
      fontSize={fontSize}
      padding={padding}
      borderRadius={borderRadius}
      width={width}
      height={height}
      margin={margin}
      disabled={disabled}
      style={{ ...sx }} // Apply extra styling via sx prop
    >
      {icon && icon}
      {children}
    </ButtonContainer>
  );
};

export default Button;
