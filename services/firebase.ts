import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBD128ikoJKYlyb07X5e4AQXb-v8bWJGZ4",
  authDomain: "keys-6d05b.firebaseapp.com",
  databaseURL: "https://keys-6d05b-default-rtdb.firebaseio.com",
  projectId: "keys-6d05b",
  storageBucket: "keys-6d05b.firebasestorage.app",
  messagingSenderId: "124794636811",
  appId: "1:124794636811:web:22405926b9954c0d52950e",
  measurementId: "G-CEN4M48SZ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
