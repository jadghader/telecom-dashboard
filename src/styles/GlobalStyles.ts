// src/styles/GlobalStyles.ts
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Space Grotesk", "Segoe UI", sans-serif;
  }

  html, body, #root {
    min-height: 100%;
  }

  body {
    overflow-x: hidden;
    width: 100%;
    color: ${({ theme }) => theme.text};
    background:
      radial-gradient(circle at 12% 18%, rgba(63, 107, 91, 0.16), transparent 38%),
      radial-gradient(circle at 88% 10%, rgba(36, 76, 90, 0.16), transparent 36%),
      ${({ theme }) => theme.background};
    line-height: 1.45;
  }

  h1, h2, h3, h4, h5 {
    letter-spacing: -0.02em;
    font-family: "Plus Jakarta Sans", "Space Grotesk", sans-serif;
  }

  ::selection {
    background: ${({ theme }) => theme.primary};
    color: #fff;
  }
`;

export default GlobalStyles;
