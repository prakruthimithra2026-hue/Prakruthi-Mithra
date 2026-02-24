
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnHS6fbUuHjPZtwZbPqa7I_EffbgXS9Jk",
  authDomain: "prakruthi-mithra.firebaseapp.com",
  projectId: "prakruthi-mithra",
  storageBucket: "prakruthi-mithra.firebasestorage.app",
  messagingSenderId: "591394766924",
  appId: "1:591394766924:web:2bcb1b918b82486744f4e9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
