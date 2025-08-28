
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLTgF4jRBOzYy-CTUwXaeCutlP5oaqi14",
  authDomain: "disaster-816ce.firebaseapp.com",
  projectId: "disaster-816ce",
  storageBucket: "disaster-816ce.firebasestorage.app",
  messagingSenderId: "904384953640",
  appId: "1:904384953640:web:14d5e797c427000e17e41d",
  measurementId: "G-4GXSNHLNZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
