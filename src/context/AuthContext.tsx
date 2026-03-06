import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, authReady, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isEmailAllowlisted = async (email: string): Promise<boolean> => {
    const whitelistSnap = await getDoc(doc(db, "auth_whitelist", "config"));
    if (!whitelistSnap.exists()) {
      return false;
    }
    const data = whitelistSnap.data();
    const allowedEmails: string[] = Array.isArray(data.allowedEmails)
      ? data.allowedEmails.map((entry: string) => entry.toLowerCase())
      : [];
    return allowedEmails.includes(email.trim().toLowerCase());
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isCancelled = false;

    const initAuthListener = async () => {
      await authReady;
      if (isCancelled) return;

      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser?.email) {
          setUser(currentUser);
          setIsLoading(false);
          return;
        }

        try {
          const allowed = await isEmailAllowlisted(currentUser.email);
          if (!allowed) {
            await auth.signOut();
            setUser(null);
            setIsLoading(false);
            return;
          }
          setUser(currentUser);
          setIsLoading(false);
        } catch (error) {
          // Temporary Firestore/network errors should not force-logout a valid session.
          console.error("Whitelist check failed; keeping existing session:", error);
          setUser(currentUser);
          setIsLoading(false);
        }
      });
    };

    initAuthListener().catch((error) => {
      console.error("Failed to initialize auth listener:", error);
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
