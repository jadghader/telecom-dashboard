// src/firebase/auth.ts
import { signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth } from "../firebase";

/**
 * Logs in a user using email and password.
 * @param email - User's email address
 * @param password - User's password
 * @returns The authenticated User object
 * @throws Error if login fails
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    console.error("Login error:", error);
    throw new Error("Failed to login. Please check your credentials.");
  }
};

/**
 * Logs out the currently authenticated user.
 * @returns Promise<void>
 * @throws Error if logout fails
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    console.error("Logout error:", error);
    throw new Error("Logout failed. Please try again.");
  }
};
