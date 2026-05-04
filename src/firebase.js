import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp, getDocs, getDoc, deleteDoc, writeBatch } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export { 
  auth, db, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut,
  collection, doc, setDoc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp, getDocs, getDoc, deleteDoc, writeBatch 
};
