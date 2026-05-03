import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, getDoc, deleteDoc } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export { 
  auth, db, 
  signInWithEmailAndPassword, onAuthStateChanged, signOut,
  collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, getDoc, deleteDoc 
};
