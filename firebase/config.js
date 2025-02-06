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
 apiKey: "AIzaSyB3hIfkPG1nUENcB_cB1LpG3AGNXxy8b2A",
  authDomain: "pavan-ce10b.firebaseapp.com",
  projectId: "pavan-ce10b",
  storageBucket: "pavan-ce10b.firebasestorage.app",
  messagingSenderId: "159960083047",
  appId: "1:159960083047:web:e6eaa2caf7d554662402c2",
  measurementId: "G-3XD6ELTL0J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export { createUserWithEmailAndPassword, signInWithEmailAndPassword ,GoogleAuthProvider, signInWithPopup,};
