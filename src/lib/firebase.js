// lib/firebase.js
import {initializeApp, getApps} from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Garante que o app só seja inicializado uma vez
const app =
  getApps().length > 0
    ? getApps()[0]
    : firebaseConfig.apiKey
      ? initializeApp(firebaseConfig)
      : null;

// Se não houver app (por falta de chave no build), auth será null
const auth = app ? getAuth(app) : null;

export {auth};
