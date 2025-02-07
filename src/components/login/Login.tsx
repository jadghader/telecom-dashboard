import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { Snackbar, Alert, Slide, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import styled from "styled-components";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Import the eye icons

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">(
    "error"
  );
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const isValidEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  };

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEmailLoading(true);

    // Input validation
    if (!isValidEmail(email)) {
      setSnackbarMessage("Invalid email address");
      setSnackbarType("error");
      setOpenSnackbar(true);
      setIsEmailLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const errorMessage = err.message;
      setSnackbarMessage(errorMessage);
      setSnackbarType("error");
      setOpenSnackbar(true);
      setIsEmailLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      window.location.href = "/dashboard";
    }

    if (user && !isAdmin) {
      signOut(auth) // Log out the user
        .then(() => {
          setSnackbarMessage("You are not an admin.");
          setSnackbarType("error");
          setOpenSnackbar(true);
          setIsEmailLoading(false); // Stop loading after the error message is displayed
        })
        .catch((error) => {
          setSnackbarMessage("Error signing out.");
          setSnackbarType("error");
          setOpenSnackbar(true);
          setIsEmailLoading(false);
        });
    }
  }, [user, isAdmin]);

  return (
    <LoginContainer>
      <LoginCard>
        <Form onSubmit={handleEmailLogin}>
          <Title>Login</Title>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <PasswordContainer>
            <Input
              type={showPassword ? "text" : "password"} // Toggle between password and text
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordIcon onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </PasswordIcon>
          </PasswordContainer>
          <Button type="submit" disabled={isEmailLoading || authLoading}>
            {isEmailLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Login"
            )}
          </Button>
        </Form>
      </LoginCard>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Positioning at the top
        TransitionComponent={(props) => (
          <Slide {...props} direction="down" timeout={500} />
        )}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarType}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LoginContainer>
  );
};

export default Login;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
  padding-top: 50px;
`;

const LoginCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
`;

const Form = styled.form`
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.text};
  font-size: 1.8rem;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => theme.accent};
  border-radius: 4px;
  font-size: 1rem;
  color: ${({ theme }) => theme.inputText};
  background-color: ${({ theme }) => theme.inputBackground};
  transition: border 0.3s ease;

  &:focus {
    border-color: ${({ theme }) => theme.hoverAccent};
  }
  &:focus-visible {
    border-color: ${({ theme }) => theme.hoverAccent};
  }

  &::placeholder {
    color: ${({ theme }) => theme.placeholderColor};
  }
`;

const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordIcon = styled.div`
  position: absolute;
  right: 10px;
  top: 40%;
  transform: translateY(-50%);
  cursor: pointer;
  color: ${({ theme }) => theme.inputText};
  z-index: 2;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  color: white;
  background-color: ${({ theme }) => theme.accent};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.hoverAccent};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
