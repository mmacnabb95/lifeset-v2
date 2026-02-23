// Firebase Client SDK Configuration (for client-side auth)
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC0J13ZNoc_igOMAJb2-QBfKBRaStpCikQ",
  authDomain: "lifeset-v2.firebaseapp.com",
  projectId: "lifeset-v2",
  storageBucket: "lifeset-v2.firebasestorage.app",
  messagingSenderId: "178817634463",
  appId: "1:178817634463:web:627c56190c9a1a61e252aa",
  measurementId: "G-1GTJ51M4JL"
};

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

export default app;

