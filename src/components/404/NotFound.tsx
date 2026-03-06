import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useDeviceType } from "../../hooks/useDeviceType";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // Redirects to home
    }, 1500); // Adjust the delay (in milliseconds) as needed

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container deviceType={deviceType}>
      <Content deviceType={deviceType}>
        <TextContent deviceType={deviceType}>
          <ErrorCode deviceType={deviceType}>404</ErrorCode>
          <Message deviceType={deviceType}>
            Oops! The page you're looking for doesn't exist. You will be
            redirected to the homepage.
          </Message>
        </TextContent>
      </Content>
    </Container>
  );
};

export default NotFoundPage;

// Styled Components
const Container = styled.div<{ deviceType: "mobile" | "tablet" | "desktop" }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  text-align: center;
  padding: ${({ deviceType }) =>
    deviceType === "mobile"
      ? "1rem"
      : deviceType === "tablet"
      ? "2rem"
      : "4rem"};
`;

const Content = styled.div<{ deviceType: "mobile" | "tablet" | "desktop" }>`
  display: flex;
  flex-direction: ${({ deviceType }) =>
    deviceType === "mobile" ? "column" : "row"};
  justify-content: center;
  align-items: center;
  width: ${({ deviceType }) =>
    deviceType === "mobile" ? "100%" : deviceType === "tablet" ? "80%" : "60%"};
  max-width: 1000px;
  padding: ${({ deviceType }) =>
    deviceType === "mobile"
      ? "2rem"
      : deviceType === "tablet"
      ? "2rem"
      : "3rem"};
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
`;

const TextContent = styled.div<{ deviceType: "mobile" | "tablet" | "desktop" }>`
  width: ${({ deviceType }) =>
    deviceType === "mobile" ? "100%" : deviceType === "tablet" ? "60%" : "60%"};
  text-align: left;
`;

const ErrorCode = styled.h1<{ deviceType: "mobile" | "tablet" | "desktop" }>`
  font-size: ${({ deviceType }) =>
    deviceType === "mobile"
      ? "6rem"
      : deviceType === "tablet"
      ? "7rem"
      : "8rem"};
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.accent};
`;

const Message = styled.p<{ deviceType: "mobile" | "tablet" | "desktop" }>`
  font-size: ${({ deviceType }) =>
    deviceType === "mobile"
      ? "1.2rem"
      : deviceType === "tablet"
      ? "1.125rem"
      : "1.25rem"};
  margin: 1rem 0;
  color: ${({ theme }) => theme.text};
`;
