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
}

const ButtonContainer = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ width }) => width || "auto"}; // Custom width if provided
  height: ${({ height }) => height || "auto"}; // Custom height if provided
  margin: ${({ margin }) => margin || "0"}; // Custom margin if provided
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
  cursor: pointer;
  background-color: ${({ theme }) => theme.primary};
  color: #FFFFFF;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.accent};
    transform: scale(1.01);
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
}) => {
  return (
    <ButtonContainer
      onClick={onClick}
      size={size}
      fontSize={fontSize}
      padding={padding}
      borderRadius={borderRadius}
      width={width}
      height={height}
      margin={margin}
    >
      {icon && icon}
      {children}
    </ButtonContainer>
  );
};

export default Button;
