import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAc72DkvFkpTc07evD6vktf0smu73kmUQc",
  authDomain: "blockchain-demo-1b299.firebaseapp.com",
  projectId: "blockchain-demo-1b299",
  storageBucket: "blockchain-demo-1b299.firebasestorage.app",
  messagingSenderId: "317095012118",
  appId: "1:317095012118:web:393c767b3c473a145a1237",
  measurementId: "G-C518QV6KRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
