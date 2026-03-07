// src/styles/GlobalStyles.ts
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  :root {
  }

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
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.background} 0%,
      ${({ theme }) => theme.backgroundLight} 50%,
      ${({ theme }) => theme.background} 100%
    ),
    radial-gradient(circle at 12% 18%, rgba(63, 107, 91, 0.1), transparent 38%),
    radial-gradient(circle at 88% 10%, rgba(36, 76, 90, 0.1), transparent 36%);
    background-attachment: fixed;
    line-height: 1.45;
  }

  h1, h2, h3, h4, h5 {
    letter-spacing: -0.02em;
    font-family: "Plus Jakarta Sans", "Space Grotesk", sans-serif;
  }

  ::selection {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
`;

export default GlobalStyles;
