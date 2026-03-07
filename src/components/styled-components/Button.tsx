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

interface ButtonStyleProps {
  $size?: "small" | "medium" | "large";
  $fontSize?: string;
  $padding?: string;
  $borderRadius?: string;
  $width?: string;
  $height?: string;
  $margin?: string;
}

const ButtonContainer = styled.button<ButtonStyleProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $width }) => $width || "auto"};
  height: ${({ $height }) => $height || "auto"};
  margin: ${({ $margin }) => $margin || "0"};
  padding: ${({ $padding, $size }) => {
    if ($padding) return $padding;
    switch ($size) {
      case "small":
        return "10px 16px";
      case "large":
        return "16px 32px";
      case "medium":
      default:
        return "12px 24px";
    }
  }};
  font-size: ${({ $fontSize, $size }) => {
    if ($fontSize) return $fontSize;
    switch ($size) {
      case "small":
        return "14px";
      case "large":
        return "18px";
      case "medium":
      default:
        return "16px";
    }
  }};
  font-weight: 700;
  letter-spacing: 0.3px;
  border: none;
  border-radius: ${({ $borderRadius }) => $borderRadius || "12px"};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  background: ${({ theme, disabled }) => {
    if (disabled) {
      return theme.disabled;
    }
    return `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`;
  }};
  color: #ffffff;
  box-shadow: ${({ theme, disabled }) =>
    disabled
      ? "none"
      : `0 12px 28px ${theme.shadow}30`};
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.25),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    box-shadow: ${({ theme }) => `0 18px 48px ${theme.shadow}40`};
    transform: translateY(-3px) scale(1.03);

    &::before {
      left: 100%;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
  }

  svg {
    margin-right: 8px;
    transition: transform 0.3s ease;
  }

  &:hover:not(:disabled) svg {
    transform: scale(1.1);
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
      $size={size}
      $fontSize={fontSize}
      $padding={padding}
      $borderRadius={borderRadius}
      $width={width}
      $height={height}
      $margin={margin}
      disabled={disabled}
      style={{ ...sx }} // Apply extra styling via sx prop
    >
      {icon && icon}
      {children}
    </ButtonContainer>
  );
};

export default Button;
