// src/styles/GlobalStyles.ts
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Montserrat', sans-serif;

  }
  html, body {
    overflow-x: hidden; /* Prevent horizontal scroll */
    width: 100%; /* Ensure the body takes up full width */
  }
`;

export default GlobalStyles;
