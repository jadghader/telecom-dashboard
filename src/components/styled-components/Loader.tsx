// src/components/common/Loader.tsx
import React from "react";
import { CircularProgress, Box } from "@mui/material";
import styled from "styled-components";

const LoaderWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background-color: ${(props) => props.theme.background};
  z-index: 9999; // Ensure it's on top of other elements
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const StyledCircularProgress = styled(CircularProgress)`
  color: ${(props) =>
    props.theme.primary}; // Customize color based on the theme
  size: 120px; // Make it larger
  thickness: 6px; // Thicker stroke for a more beautiful look
  animation: rotate 1.4s linear infinite; // Add a smooth rotating animation

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Loader: React.FC = () => (
  <LoaderWrapper>
    <StyledCircularProgress />
  </LoaderWrapper>
);

export default Loader;
