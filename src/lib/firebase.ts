import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAblKfbaiaJCbxSqfSfyzCRSp6D9x3lKkI",
  authDomain: "ovi-atelier.firebaseapp.com",
  projectId: "ovi-atelier",
  storageBucket: "ovi-atelier.firebasestorage.app",
  messagingSenderId: "938788960959",
  appId: "1:938788960959:web:5ba49010bff2175d07a40a",
  measurementId: "G-7NCV22C0YJ",
};

// Initialize Firebase (singleton pattern safe for Next.js SSR)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Custom parameters for Google OAuth
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Analytics only in client-side supported environment
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, googleProvider, analytics };
