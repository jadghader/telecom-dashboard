import { initializeApp, FirebaseOptions } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getFirebaseConfigFromEnv = (): FirebaseOptions => {
  const encoded = process.env.REACT_APP_FIREBASE_CONFIG_B64;
  if (!encoded) {
    throw new Error(
      "REACT_APP_FIREBASE_CONFIG_B64 environment variable is not set."
    );
  }
  const decoded = atob(encoded);

  try {
    return JSON.parse(decoded) as FirebaseOptions;
  } catch {
    throw new Error(
      "REACT_APP_FIREBASE_CONFIG_B64 must be a base64-encoded JSON Firebase config."
    );
  }
};

const firebaseConfig = getFirebaseConfigFromEnv();

const app = initializeApp(firebaseConfig);
const auth = getAuth();
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Session persistence is now set to session-only.");
  })
  .catch((error) => {
    console.error("Error setting persistence: ", error);
  });

const db = getFirestore(app);

export { app, auth, db };
