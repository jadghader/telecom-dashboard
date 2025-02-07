// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAv_LoqDDk9MTeuxCRa1eLiPGUn-HEc5WI",
  authDomain: "telecom-dashboard.firebaseapp.com",
  projectId: "telecom-dashboard",
  storageBucket: "telecom-dashboard.firebasestorage.app",
  messagingSenderId: "958001589714",
  appId: "1:958001589714:web:9648234467f0a5684c2c0b",
  measurementId: "G-KC23WH3ZQD",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Session persistence is now set to session-only.");
  })
  .catch((error) => {
    console.error("Error setting persistence: ", error);
  });

const db = getFirestore(app);

export { app, auth, db, analytics };
