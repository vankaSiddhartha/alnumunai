// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword ,GoogleAuthProvider, signInWithPopup,} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQyUmx9ObfnAln-gzAPBlzJ-9c8GklifM",
  authDomain: "honest-chain.firebaseapp.com",
  databaseURL: "https://honest-chain-default-rtdb.firebaseio.com",
  projectId: "honest-chain",
  storageBucket: "honest-chain.appspot.com",
  messagingSenderId: "867934806054",
  appId: "1:867934806054:web:a3a8728425c805f54d86e7",
  measurementId: "G-B2XTP9NGRY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export { createUserWithEmailAndPassword, signInWithEmailAndPassword ,GoogleAuthProvider, signInWithPopup,};
