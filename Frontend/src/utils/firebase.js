import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TEMPORARY - Hardcoded values for testing
const firebaseConfig = {
  apiKey: "AIzaSyDLY4qIePA_Qx1oZs-HwQW31_pWD0991ok",
  authDomain: "codifyx-a30fb.firebaseapp.com",
  projectId: "codifyx-a30fb",
  storageBucket: "codifyx-a30fb.appspot.com",
  messagingSenderId: "348955141685",
  appId: "1:348955141685:web:034a43c1240033603c337c",
  measurementId: "G-Z477XK8XQ1",
};

// Validate configuration
if (!firebaseConfig.apiKey) {
  console.error("❌ Firebase API Key is missing or invalid.");
} else {
  console.log("✅ Firebase config loaded successfully");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
