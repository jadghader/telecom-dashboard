// src/firebase/auth.ts
import { signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth, authReady } from "../firebase";

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    await authReady;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    console.error("Login error:", error);
    throw new Error("Failed to login. Please check your credentials.");
  }
};


export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    console.error("Logout error:", error);
    throw new Error("Logout failed. Please try again.");
  }
};
