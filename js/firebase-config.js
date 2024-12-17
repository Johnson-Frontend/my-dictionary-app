// Import Firebase dependencies from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9acWfGf7tfuYoh2Ti1d_mlcp8omqkJUs",
  authDomain: "simple-dictionary-app.firebaseapp.com",
  projectId: "simple-dictionary-app",
  storageBucket: "simple-dictionary-app.appspot.com", // Fixed storageBucket typo
  messagingSenderId: "333477781206",
  appId: "1:333477781206:web:bcb94806e56ce7cb6d3377",
  measurementId: "G-89GZ0P3G5M",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Firestore database instance
export const db = getFirestore(app);

console.log("Firebase initialized and Firestore ready:", db);


