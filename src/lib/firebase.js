import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Web config is public by design; Auth + RTDB rules protect writes.
// Env vars override when set (local .env / Netlify UI).
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyCf4OPA0-SIyIA486KLYxM21t2xcHc_20g",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "slc-cs-sow-findings.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://slc-cs-sow-findings-default-rtdb.firebaseio.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "slc-cs-sow-findings",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "slc-cs-sow-findings.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1043968258425",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:1043968258425:web:d66b8d04e5077bc0ca3fa8"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
