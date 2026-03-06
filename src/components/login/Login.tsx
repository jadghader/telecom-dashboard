import React, { useEffect, useState } from "react";
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
  const { user, isLoading: authLoading } = useAuth();

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

  useEffect(() => {
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

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
  mb: 1.4,
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
};

export default Login;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 22px;
`;

const Shell = styled.div`
  width: min(980px, 100%);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.borderColor};
  box-shadow: 0 20px 45px ${({ theme }) => theme.shadow};
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: ${({ theme }) => theme.cardBackground};

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const BrandPanel = styled.section`
  padding: 36px 30px;
  background: linear-gradient(
    140deg,
    ${({ theme }) => theme.primary} 0%,
    ${({ theme }) => theme.accent} 100%
  );
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 860px) {
    min-height: 180px;
  }
`;

const Tag = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.86;
`;

const BrandTitle = styled.h2`
  margin-top: 12px;
  font-size: clamp(1.5rem, 2.2vw, 2rem);
  line-height: 1.2;
`;

const BrandSubtext = styled.p`
  margin-top: 12px;
  opacity: 0.9;
  max-width: 34ch;
`;

const LoginCard = styled.div`
  padding: 34px 28px;
  background: ${({ theme }) => theme.backgroundElevated};
`;

const Form = styled.form`
  max-width: 390px;
  margin: 0 auto;
`;

const SubtitleText = styled(Typography)`
  margin-bottom: 2.2rem !important;
  color: ${({ theme }) => theme.textMuted} !important;
  font-size: 0.95rem !important;
`;

const Button = styled.button`
  width: 100%;
  margin-top: 6px;
  padding: 0.72rem;
  font-size: 0.98rem;
  font-weight: 700;
  color: white;
  background: ${({ theme }) => theme.primary};
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.primaryHover};
  }

  &:disabled {
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.disabled};
  }
`;

const DividerText = styled.div`
  margin: 14px 0 10px;
  text-align: center;
  position: relative;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.86rem;

  span {
    background: ${({ theme }) => theme.backgroundElevated};
    padding: 0 10px;
    position: relative;
    z-index: 1;
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    border-top: 1px solid ${({ theme }) => theme.borderColor};
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  height: 42px;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackground};
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
    transform: none;
  }
`;
