// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEl0yT8K9fuPIHQkHGhr_C-h_RAeXY7J8",
  authDomain: "geo-rl.firebaseapp.com",
  projectId: "geo-rl",
  storageBucket: "geo-rl.firebasestorage.app",
  messagingSenderId: "834173115366",
  appId: "1:834173115366:web:2e33e62dc47851a37bd427",
  measurementId: "G-C3MKXLG41X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
