import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBnYWll7EGgW09R_MzjoXDbyPvcxAJ7TTQ",
  authDomain: "ai-prompt-hub-4b945.firebaseapp.com",
  projectId: "ai-prompt-hub-4b945",
  storageBucket: "ai-prompt-hub-4b945.firebasestorage.app",
  messagingSenderId: "1065904239600",
  appId: "1:1065904239600:web:db0a04c4f4ac525b4ba335"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
