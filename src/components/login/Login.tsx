import React, { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Slide,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import styled from "styled-components";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import { doc, getDoc } from "firebase/firestore";
import { loginWithEmail } from "../../firebase/auth";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">(
    "error",
  );
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { isLoading: authLoading } = useAuth();

  const isValidEmail = (emailValue: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(emailValue);
  };

  const isEmailAllowed = async (emailToCheck: string): Promise<boolean> => {
    try {
      const whitelistRef = doc(db, "auth_whitelist", "config");
      const whitelistSnap = await getDoc(whitelistRef);
      if (!whitelistSnap.exists()) {
        return false;
      }

      const data = whitelistSnap.data();
      const allowedEmails: string[] = data.allowedEmails || [];
      const normalizedEmail = emailToCheck.trim().toLowerCase();

      return allowedEmails.includes(normalizedEmail);
    } catch (error) {
      console.error("Failed to read auth whitelist:", error);
      return false;
    }
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEmailLoading(true);

    if (!isValidEmail(email)) {
      setSnackbarMessage("Invalid email address");
      setSnackbarType("error");
      setOpenSnackbar(true);
      setIsEmailLoading(false);
      return;
    }

    try {
      const user = await loginWithEmail(email, password);
      const allowed = await isEmailAllowed(user.email || "");

      if (!allowed) {
        await signOut(auth);
        setSnackbarMessage(
          "This email is not allowed to access this dashboard.",
        );
        setSnackbarType("error");
        setOpenSnackbar(true);
      }
    } catch (error: any) {
      setSnackbarMessage(error.message || "Failed to login.");
      setSnackbarType("error");
      setOpenSnackbar(true);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const allowed = await isEmailAllowed(userCredential.user.email || "");

      if (!allowed) {
        await signOut(auth);
        setSnackbarMessage(
          "This Google account is not allowed to access this dashboard.",
        );
        setSnackbarType("error");
        setOpenSnackbar(true);
      }
    } catch (error: any) {
      setSnackbarMessage(error.message || "Google login failed.");
      setSnackbarType("error");
      setOpenSnackbar(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };



  return (
    <LoginContainer>
      <Shell>
        <BrandPanel>
          <Tag>Telecom Operations</Tag>
          <BrandTitle>Revenue Intelligence Dashboard</BrandTitle>
          <BrandSubtext>
            Track sales, customers, products, and profitability with a single
            clean workflow.
          </BrandSubtext>
        </BrandPanel>

        <LoginCard>
          <Form onSubmit={handleEmailLogin}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Welcome Back
            </Typography>
            <SubtitleText>
              Login with an approved company email.
            </SubtitleText>

            <TextField
              type="email"
              label="Email Address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
              fullWidth
              size="small"
              sx={fieldSx}
            />

            <TextField
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
              size="small"
              sx={fieldSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      aria-label="Toggle password visibility"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              disabled={isEmailLoading || isGoogleLoading || authLoading}
            >
              {isEmailLoading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Log In"
              )}
            </Button>

            <DividerText>
              <span>or</span>
            </DividerText>

            <GoogleButton
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isEmailLoading || authLoading}
            >
              {isGoogleLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <GoogleIcon fontSize="small" />
                  Continue with Google
                </>
              )}
            </GoogleButton>
          </Form>
        </LoginCard>
      </Shell>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3200}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={(props) => (
          <Slide {...props} direction="down" timeout={400} />
        )}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarType}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LoginContainer>
  );
};

const fieldSx = {
  mb: 1.8,
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.7)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.85)",
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(255,255,255,0.95)",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "currentColor",
  },
};

export default Login;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 22px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.background} 0%,
    ${({ theme }) => theme.backgroundLight} 100%
  );
`;

const Shell = styled.div`
  width: min(1020px, 100%);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid ${({ theme }) =>
    theme.borderColor}30;
  box-shadow: 0 32px 64px ${({ theme }) =>
    theme.shadow}25;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  background: ${({ theme }) => theme.cardBackground};
  backdrop-filter: blur(10px);
  animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const BrandPanel = styled.section`
  padding: 48px 40px;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 50%,
    #f093fb 100%
  );
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: drift 20s linear infinite;
  }

  @keyframes drift {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }

  @media (max-width: 860px) {
    min-height: 220px;
    padding: 36px 30px;
  }
`;

const Tag = styled.span`
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.9;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const BrandTitle = styled.h2`
  margin-top: 18px;
  font-size: clamp(1.5rem, 2.5vw, 2.2rem);
  line-height: 1.25;
  font-weight: 800;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const BrandSubtext = styled.p`
  margin-top: 16px;
  opacity: 0.95;
  max-width: 35ch;
  font-size: 0.95rem;
  line-height: 1.6;
`;

const LoginCard = styled.div`
  padding: 48px 36px;
  background: ${({ theme }) => theme.backgroundElevated};
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 600px) {
    padding: 36px 24px;
  }
`;

const Form = styled.form`
  max-width: 360px;
  margin: 0 auto;
`;

const SubtitleText = styled(Typography)`
  margin-bottom: 2.8rem !important;
  color: ${({ theme }) => theme.textMuted} !important;
  font-size: 0.95rem !important;
  line-height: 1.5 !important;
`;

const Button = styled.button`
  width: 100%;
  margin-top: 8px;
  padding: 14px;
  font-size: 0.98rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary} 0%, ${({ theme }) => theme.accent} 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 28px ${({ theme }) => `${theme.shadow}30`};

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
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 18px 40px ${({ theme }) => `${theme.shadow}40`};
    
    &::before {
      left: 100%;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const DividerText = styled.div`
  margin: 20px 0 16px;
  text-align: center;
  position: relative;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.85rem;
  font-weight: 600;

  span {
    background: ${({ theme }) => theme.backgroundElevated};
    padding: 0 12px;
    position: relative;
    z-index: 1;
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    border-top: 1px solid ${({ theme }) =>
    theme.borderColor}40;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  height: 48px;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.inputBackground} 0%,
    ${({ theme }) => theme.backgroundLight} 100%
  );
  border: 1.5px solid ${({ theme }) =>
  theme.borderColor}60;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 12px;
    padding: 1.5px;
    background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.accent});
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px ${({ theme }) =>
    theme.shadow}15;

    &::before {
      opacity: 1;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  svg {
    font-size: 1.1rem;
  }
`;
